<?php

class VLV_Event {

  var $id            = 0;
  var $type          = '';
  var $weekday       = '';
  var $dates         = '';
  var $times         = '';
  var $location      = '';
  var $groups        = '';
  var $lastmodified  = '';
  var $event_list    = array();
  var $fortnightly   = false;

  function __construct($id) {
    $this->id = $id;
  }

  function setType($type) {
    $this->type = trim($type);
  }

  function setWeekday($weekday) {
    $this->weekday = trim($weekday);
  }

  function setDates($dates) {
    $this->dates = trim($dates);
  }

  function setTimes($times) {
    $this->times = trim($times);
  }

  function setLocation($location) {
    $this->location = trim($location);
  }

  function setGroups($groups) {
    $this->groups = trim($groups);
  }

  function setLastmodified($lastmodified) {
    $this->lastmodified = trim($lastmodified);
  }

  function setEventList($eventlist) {
    if(is_array($eventlist)) {
      $this->event_list = $eventlist;
    }
  }

  function setFortnightly($fortnightly) {
    $this->fortnightly = $fortnightly;
  }

}

?>