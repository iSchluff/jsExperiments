<?php

class VLV_Lecture {

  var $title          = '';
  var $id            = 0;
  var $lecturer      = '';
  var $events        = array();
  var $groups        = array();
  var $certificates  = array();
  var $comments      = array();
  var $hint          = '';

  function __construct($id) {
    $this->id = $id;
  }

  function setTitle($title) {
    $this->title = trim($title);
  }

  function setLecturer($lecturer) {
    $this->lecturer = trim($lecturer);
  }

  function setEvents($events) {
    if(is_array($events)) {
      $this->events = $events;
    }
  }

  function setGroups($groups) {
    if(is_array($groups)) {
      $this->groups = $groups;
    }
  }

  function setCertificates($certificates) {
    if(is_array($certificates)) {
      $this->certificates = $certificates;
    }
  }

  function setComments($comments) {
    if(is_array($comments)) {
      $this->comments = $comments;
    }
  }

  function setHint($hint) {
    $this->hint = trim($hint);
  }

}

?>