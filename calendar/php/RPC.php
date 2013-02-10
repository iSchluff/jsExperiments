<?php

include('Parser.php');

class VLV_RPC {
  
    public static $prefix = 'VLV.';
    
    /**
     * searches for needle in event names
     * 
     * returns associative array with search results 
     * 
     * @param string needle searches event names containing needle
     * @param string semester defines which calendar is used for searching (e.g. WS0809), default from config
     * @return array associative array with search results
    **/
    public static function findByName($needle, $semester = NULL) {
        
      $res = VLV_Parser::search($needle);
        
      return $res;
    }
    
    /**
     * returns array of all events listed for given semester
     * 
     * @param string $semester defines which calendar is used for searching (e.g. WS0809), default from config
     * @return array
     */
    public static function findAll($semester = NULL) {
      return VLV_Parser::search('%');
    }

    /**
    *
    * @return string version
    **/
    public function getVersion() {
        return "0.1";
    }

}

?>