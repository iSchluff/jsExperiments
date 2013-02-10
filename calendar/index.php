<!doctype html> 
<html lang="de">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="author" content="Anton Schubert"/>
	<title> Web Experiments </title>
	<meta name="viewport" content=" initial-scale=.7, minimum-scale=.7, user-scalable=yes" />
	<link href="http://fonts.googleapis.com/css?family=Hammersmith+One|Montserrat|Open+Sans:600" rel="stylesheet" type="text/css">
</head>
<body>

	<div id="header">
		<h1>
			Web-Experiments
		</h1>
	</div>
	<?php
	include "php/RPC.php";
	echo count(VLV_RPC::findAll("WS0809"));
	?>
</body>
</html>
