<?php

include('Lecture.php');
include('Event.php');

class VLV_Parser {

  static function search($needle) {
    global $_CONFIG;

    setlocale(LC_TIME,$_CONFIG['vlv_locale']);
	
	$fp = fopen(sprintf("http://www.tu-ilmenau.de/vlv/index.php?id=330&funccall=1&vers=text&sgkurz=MT&studiengang=Medientechnologie&fs=1.FS&aendvlv=0&sggruppe=MT+1.FS+2",'%'),"r");
    //$fp = fopen(sprintf($_CONFIG['vlv_search_url'],$needle),"r");
    if (!$fp) {
        echo "<p>Datei konnte nicht geöffnet werden.</p>\n";
        exit;
    }

    while (!feof ($fp)) {
        $content .= fgets ($fp, 1024);
    }

    $content = iconv("ISO-8859-1", "UTF-8", $content);
    
    $results = array();
        
          // split search results
                $matches = preg_split('/(<\/div>\n<p>&nbsp;<\/p>\n<div id="nr[A-Z0-9]*" >\n)?<p class="stupla_bold">/m',$content);
        
                // parse matches
                for($i = 1; $i < count($matches); $i++) {
            // extract details
            $details = array();
            preg_match('/(.*) <a href=".*?fid=(.*)" target="_blank"[^>]*>Beschreibung<\/a><\/p>\n<p>(.*)<\/p>.*<\/thead>(.*)<\/table>/sm',$matches[$i],$details);
                        
            $lecture = new VLV_Lecture($details[2]); // create VLVLecture object with id as key
            $lecture->setTitle($details[1]);        // set lecture title                        
            $lecture->setLecturer($details[3]);     // set lecturer
            
            // split in event categories (lecture, tutorial, examination)
            preg_match_all('/<tbody>(.*?)<\/tbody>/ms',$details[4],$categories);
            
            $event_objects = array();
          
            foreach($categories[1] as $category) {
              // split in single events
              preg_match_all('/<tr[^>]*>\n<t[dh] [^>]*>(.*?)<\/td>\n<\/tr>\n?/ms',$category,$events);
              
              $last_cat = '';
        foreach($events[1] as $event) {
          $event_details = preg_split('/<\/t[dh]>\n<t[dh] [^>]*>/',$event);
          
                $event_details[0] = str_replace(':','',$event_details[0]);
                if($event_details[0] != '&nbsp;' && $last_cat != $event_details[0]) {
                  $last_cat = $event_details[0];
                } elseif($event_details[0] == '&nbsp;') {
                  $event_details[0] = $last_cat;
                }

                $event_object = new VLV_Event($details[2]);
          $event_object->setType($event_details[0]);
          $event_object->setWeekday($event_details[1]);
          $event_object->setDates($event_details[2]);
          $event_object->setTimes($event_details[3]);
          $event_object->setLocation($event_details[4]);
          $event_object->setGroups($event_details[5]);
          $event_object->setLastmodified($event_details[6]);
          
          $parsed_event = self::parseEvents($event_details[2],$event_details[1],$event_details[3]);
          $event_object->setEventList($parsed_event['events']);
          $event_object->setFortnightly($parsed_event['fortnightly']);
          
          $event_objects[] = $event_object;
              }
            }
            
            $lecture->setEvents($event_objects);
        
            $results[] = $lecture;
    }

    return $results;
  }

  static function parseEvents($str,$event_weekday,$event_time) {
    $events = array();

    $fortnightly = false;

    // try to parse $event_weekday
    if(!strptime($event_weekday,'%A')) return $events; // Montag

    // try to parse $event_time
    if(preg_match('/(\d\d)\.(\d\d)\s-\s\d\d\.\d\d/s',$event_time,$times)) { //17.00 - 18.30
      if(count($times) > 2) {
        $event_time = 3600 * ($times[1] % 24) + 60 * ($times[2] % 60); // seconds since midnight
      }
    } else return $events;

    // check if parseable
    if(preg_match('/([UG] \((.*)\)|[^\(\)]+)/s',$str,$result)) { // G (42., 46. KW 2008 - 06. KW 2009)
      if(count($result) < 2) return $events;

      // fortnightly events
      if(eregi("[UG]",substr($result[1],0,1))) {
        $fortnightly = true;
        $week_odd = (substr($result[1],0,1) == "U") ? true : false;
        $str = $result[2];
      } else {
        $str = $result[1];
      }

      // get all year strings
      preg_match_all('(\d\d\d\d)',$str,$years,PREG_OFFSET_CAPTURE);
      $years = $years[0];
      $year1 = $years[0][0]; // first mentioned year
      $year2 = $years[1][0]; // second mentioned year
      $year2_from_pos = $years[0][1]+4; // offset first character after year1 in $str

      // split up weeks
      $parts = split('[[:space:]]?[,;][[:space:]]?',$str);

      foreach($parts as $part) {
        if(empty($part)) {
            continue;
        }
        if(strpos($str,$part)>$year2_from_pos) {
          $year = $year2;
        } else {
          $year = $year1;
        }

        // parse intervals
        $intervals = split('[[:space:]]?-[[:space:]]?',$part);
        if(count($intervals) == 2) { // a minus found
          preg_match('/(\d?\d)\.\s?(KW)?\s?(\d\d\d\d)?/i',$intervals[0],$res);
          if(count($res) > 2) { // format XX KW YYYY
            $kw = $res[1];
            $year = $res[3]; // override year
          } else { // format XX
            $kw = $res[1];
          }
          $date = strptime($event_weekday . ' ' . $kw . ' ' . $year,'%A %W %Y');
          $stamp = mktime($date[tm_hour],$date[tm_min],$date[tm_sec],$date[tm_mon] + 1,$date[tm_mday],$date[tm_year] + 1900);

          // add or subtract a week + seconds of day time
          $offset = $kw-strftime("%V",$stamp);
          $stamp = strtotime((($offset > 0)?'+':'').$offset." week",$stamp) + $event_time;

          preg_match('/(\d?\d)\.\s?(KW)?\s?(\d\d\d\d)?/i',$intervals[1],$res);
          if(count($res) > 2) { // format XX KW YYYY
            $kw = $res[1];
            $year = $res[3]; // override year
          } else { // format XX
            $kw = $res[1];
          }
          $date = strptime($event_weekday . ' ' . $kw . ' ' . $year,'%A %W %Y');
          $stamp_to = mktime($date[tm_hour],$date[tm_min],$date[tm_sec],$date[tm_mon] + 1,$date[tm_mday],$date[tm_year] + 1900);

          // add or subtract a week + seconds of day time
          $offset = $kw-strftime("%V",$stamp_to);
          $stamp_to = strtotime((($offset > 0)?'+':'').$offset." week",$stamp_to) + $event_time;

          if($stamp_to > $stamp) {
            for($s = $stamp; $s < $stamp_to; $s=strtotime("+".(($fortnightly) ? 2 : 1)." week",$s)) {
              $events[] = $s;
            }
            $events[] = $stamp_to;
          }
        } else { // no minus
          preg_match('/^(\d?\d)\.(\sKW\s)?(\d\d\d\d)?$/i',$intervals[0],$res);
          if(count($res) > 0) { // format with KW
            if(count($res) > 2) { // format XX KW YYYY
              $kw = $res[1];
              $year = $res[3]; // override year
            } else { // format XX
              $kw = $res[1];
            }
            $date = strptime($event_weekday . ' ' . $kw . ' ' . $year,'%A %W %Y');
            $stamp = mktime($date[tm_hour],$date[tm_min],$date[tm_sec],$date[tm_mon] + 1,$date[tm_mday],$date[tm_year] + 1900);

            // add or subtract a week + seconds of day time
            $offset = $kw-strftime("%V",$stamp);
            $stamp = strtotime((($offset > 0)?'+':'').$offset." week",$stamp) + $event_time;

            $events[] = $stamp;
          } elseif(eregi('[[:digit:]]{2}\.[[:digit:]]{2}\.[[:digit:]]{4}',$intervals[0])) { // normal date format
            $events[] = strtotime($intervals[0]) + $event_time;
          }
        }
      }
    }

    return array('events' => $events, 'fortnightly' => $fortnightly);
  }

}

?>