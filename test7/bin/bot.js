////////////////////////////////////////////////////////////////
//	ATTENTION ALL DEVS. PLEASE READ THE BELOW MESSAGE. THANKS!
//[http://www.mixolydianmuse.com/plug.dj/add-ons/foxbot/message]
////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
//	foxbot.js :: A robot that automates certain functions for
//		plug.dj
//	Version 101.12.13.2.1
//	Copyright 2012 1NT, FoxtrotFire, Royal Soda, [tw].me
////////////////////////////////////////////////////////////////
//	Changelog v. 101.12.13.2.1
//	-Added Announcer
//	-Added twitter
////////////////////////////////////////////////////////////////
//	Changelog v. 101.12.12.2.1
//	-Added Powdered Toast Man's custom drink
//	-Added variable welcome message
////////////////////////////////////////////////////////////////
//	Changelog v. 101.12.10.2.1
//	-Added 2 jokes
//	-Added super's and Kendall's custom drink
//	-Edited Init Message
//	-Added profanityfilter (default off, use /set profanityfilter;true to turn on)
//	-Edited facebook message
//	-Added banned list
////////////////////////////////////////////////////////////////
//	Changelog v. 101.12.10.4.1
//	-Fixed setting time limit from chat (101.12.6.4.1)
//	-Added a spam filter that -doesn't work- actually works
//	 (101.12.6.4.1)
//		-They fixed part of the API!!!!!
//	-Added a few more easter eggs
//	-Welcome AND part messages now exist
//		-Part only exists for staff (including featured DJ)
//	-Added a current version global variable (type str)
//		-PLEASE update when you change code. Effects /about
//	-Edited formatting on announces and part messages
//	-Fixed two skipping errors
//		- parseInt("09") becomes 0. So 09 minutes becomes 0.
//			-Removed parseInt entirely, and just did "09"*60.
//			-Same thing with seconds. seconds*1
//		-Skips if longer than an hour
//	-Added a /fb that sends a link to our FB

//	-Changelogs now archived at
//[http:/www.mixolydianmuse.com/plug.dj/add-ons/foxbot/changelog]
//		-Sorry for breaking formatting (only for the links)
//		-Only include changelog for MOST RECENT VERSION
//	-Edited my message and put here
//[http://www.mixolydianmuse.com/plug.dj/add-ons/foxbot/message]
////////////////////////////////////////////////////////////////
// Old changelogs
//[http:/www.mixolydianmuse.com/plug.dj/add-ons/foxbot/changelog]
////////////////////////////////////////////////////////////////

//Begin Variable Declarations
var o_settings = {
    	autoSkip: true,
    	autoWoot: true,
    	autoQueue: true,
    	welcomeMsg: true,
    	goodbyeMsg: true,
	profanityfilter: false,
	announcer: true,
	maxSongLength: 8, // in mins.
    	rules: 'Cualquier género de música es permitido, no superar los 8min. Muestra respecto a todos en la sala.',
    	welcome: 'Gracias por entrar a ForoCoches',
	strictMode: false,
	i_timerID: null,
	f_autoSkip: f_long
};

var o_tmp = {};
var b_hasModRights = false;
var cur_Vers="101.12.13.2.1";

var o_chatcmds = {
        /*
         * List of important chat strings, detected and handled accordingly in the f_checkChat method.
         * Note that the new chat parsing system requires all chat flags listed below to be entirely lowercase.
         */
	/////////////////////////////////////////////
	// chmod 555
	/////////////////////////////////////////////

	'/comandos': {
		f: f_commands,
		needsPerm: false,
		visible: true
	},



	'/reglas': {
		f: f_rule,
		needsPerm: false,
		visible: true
	},
	



	/////////////////////////////////////////////
	// chmod 554
	/////////////////////////////////////////////

	'/bloquear': {
		f: f_lock,
		needsPerm: true,
		needsLocalPerm: true,
		visible: true
	},
	'/reintentar': {
		f: f_retry,
		needsPerm: true,
		needsLocalPerm: true,
		visible: true
	},

	'/saltar': {
		f: f_skip,
		needsPerm: true,
		needsLocalPerm: true,
		visible: true
	},

	'/desbloquear': {
		f: f_unlock,
		needsPerm: true,
		needsLocalPerm: true,
		visible: true
	},
	////////////////////////////////////////////
	// chmod 111
	////////////////////////////////////////////




	'plug.dj/': {
		f: f_nospam,
		needsPerm: false,
		visible: false
	},	

        // Language handling (currently English only, so users can feel free to get colorful in French...)
        // This list can be further populated as necessary but this should cover the basics
   
	////////////////////////////////////////////
	// chmod 110
	////////////////////////////////////////////

	////////////////////////////////////////////
	// chmod 100 ::TEST COMMANDS
	////////////////////////////////////////////
};


//Begin Function Declarations
function f_foxbotInit() {
	API.sendChat('/me El bot ha sido activado');
	b_hasModRights = API.getSelf().permission.toString()>1;
	// now all the event listeners
	API.addEventListener(API.USER_JOIN, join);
	API.addEventListener("curateUpdate", f_curate);
	API.addEventListener(API.CHAT, f_checkChat);
	API.addEventListener(API.DJ_ADVANCE, f_djAdvance);
	// mute the player
	Playback.setVolume(0);
}
function join(user){
	if(user.id=="50aeb47c96fba52c3ca0e10a"){
		API.sendChat("/me :: Ohhh miren quien ha ingresado a la sala!!, @"+user.username+" ! Bienvenido");
	}
	else if(user.permission.toString()>1){
		API.sendChat("/me :: Acaba de ingresar un moderador a la sala!!. El nombre del moderador es  "+user.username+" . Venga, saludenlo!");
	}
	else{
		API.sendChat("/me :: Bienvenido @" + user.username + " a " + Models.room.data.name + ". "+o_settings.welcome);
		//window.setTimeout(function(){f_rule({from: user.username});}, 1000); //Uncomment to send rules
	}
}




function f_curate(data){
	API.sendChat("/me A " + data.user.username + " le gusta esta canción");
}
function f_commands(data){
	var cmds = '';
	for(var cmd in o_chatcmds){
		if(o_chatcmds[cmd].visible){
			cmds = cmds + cmd + ', ';
		}
	}
	cmds_clean = cmds.slice(0, -2);
	API.sendChat('/me Comandos del chat: '+cmds_clean);
}

function f_skip(data) {
    API.sendChat('/me Se ha saltado el turno del dj');
    window.setTimeout(function(){new ModerationForceSkipService(Models.room.data.historyID);}, 1000);
}
function f_long() {
	API.sendChat('@'+o_tmp.username+' Your song has played for '+o_settings.maxSongLength+' minutes and will now be skipped!');
    window.setTimeout(function(){new ModerationForceSkipService(Models.room.data.historyID);}, 1000);
}
function f_lock(data) {
        API.sendChat('/me La cabina de dj ha sido bloqueada');
        rpcGW.execute('room.update_options', null, Models.room.data.id,
              {
                name: Models.room.data.name,
                description: Models.room.data.description,
                boothLocked: true,
                waitListEnabled: Models.room.data.waitListEnabled,
                maxPlays: Models.room.data.maxPlays,
                maxDJs:5
              }
		);
}
function f_unlock(data){
	API.sendChat('/me La cabina de dj ha sido desbloqueada');
    rpcGW.execute('room.update_options', null, Models.room.data.id,
		{
			name: Models.room.data.name,
			description: Models.room.data.description,
			boothLocked: false,
			waitListEnabled: Models.room.data.waitListEnabled,
			maxPlays: Models.room.data.maxPlays,
			maxDJs:5
		}
	);
}
function f_retry(data) {
	API.sendChat('/me Por favor selecciona otra canción');
	window.setTimeout(function(){rpcGW.execute('room.update_options', null, Models.room.data.id,
		{
			name: Models.room.data.name,
			description: Models.room.data.description,
			boothLocked: true,
			waitListEnabled: Models.room.data.waitListEnabled,
			maxPlays: Models.room.data.maxPlays,
			maxDJs:5
		}
	);}, 1000);
	window.setTimeout(function(){new ModerationForceSkipService(Models.room.data.historyID);}, 3000);
	window.setTimeout(function(){rpcGW.execute('room.update_options', null, Models.room.data.id,
		{
			name: Models.room.data.name,
			description: Models.room.data.description,
			boothLocked: false,
			waitListEnabled: Models.room.data.waitListEnabled,
			maxPlays: Models.room.data.maxPlays,
			maxDJs:5
		}
	);}, 5000); //This line is part of the LAST window.setTimeout command
}	


function f_rule(data) {
	API.sendChat('/me Reglas: '+o_settings.rules);
}












function f_checkChat(data) {
//Will work on this. It's kind of annoying as it stands and doesn't allow for cool stuff
	if((data.type == "message") && (data.fromID != API.getSelf().id) ) {
		for(var s in o_chatcmds) {
			if(data.message.toString().toLowerCase().indexOf(s) != -1) { // The only requesite of this more efficient chat parsing system is that all chat vars are lowercase
				if(o_chatcmds[s].needsPerm){
					if(API.getUser(data.fromID).permission.toString()>1){
						o_chatcmds[s].f(data);
					}
					else{
						API.sendChat('Lo siento, @' + data.from + ', Pero no te puedo dejar hacer eso.');
					}
				}
				else{
					o_chatcmds[s].f(data);
				}
						   
			}
		}
	}
	
}
    
function f_getArgs(s) {
    var a_s = s.split(' '); // [0] = <command>; [1-n] args
    var s_real = '';
    for(var i = 1; i < a_s.length; i++) {
        s_real += ' ' + a_s[i];
    }
    
    a_opts = s_real.split(';');
    
    return a_opts;
    
}

function f_djAdvance(obj){
	var i_timeRem = -1;
	s_timeRem = jQuery('#time-remaining-value').text();
	// wait on music to load & time to appear
	while(s_timeRem == null){
		s_timeRem = jQuery('#time-remaining-value').text();
	}
	a_timeRem = s_timeRem.toString().split(':');
	if (a_timeRem.length<3){
	//some redundancies added because JS and typecasting randomly broke
		i_timeRem = parseInt(a_timeRem[0]*60) + parseInt(a_timeRem[1]*1);
	}
	// auto-skip code:
	// clear previous timeout
	window.clearTimeout(o_settings.i_timerID);
	// if autoskip enabled & song over time limit
	if(o_settings.autoSkip && ((i_timeRem > (o_settings.maxSongLength)*60)|| (a_timeRem.length>2))){
		//strict mode, skip immediately
		if(o_settings.strictMode){
			var o_djs = API.getDJs();
		o_tmp.username = o_djs[0].username;
		f_long();
		}
		else {
		// normal mode (and if track length more than <maxSongLength>): set a timer for <maxSongLength> mins to skip the track
			var o_djs = API.getDJs();
			o_tmp.username = o_djs[0].username;
			API.sendChat('@'+o_tmp.username+' [ADVERTENCIA] Perdon, pero tu canción supera el limite de minutos permitido en esta sala, tu canción sera quitada automaticamente dentro de '+o_settings.maxSongLength+' minutos.');
			o_settings.i_timerID = window.setTimeout(o_settings.f_autoSkip, (o_settings.maxSongLength)*60*1000);
		}
	}

	// auto-woot the track if enabled [BROKEN]
	if(o_settings.autoWoot) {
		jQuery("#button-vote-positive").click();
	}


	// autoqueue if enabled [BROKEN]
	if(o_settings.b_autoQueue) {
		if(jQuery('#button-dj-waitlist-join').css('display') != 'none') {
		jQuery('#button-dj-waitlist-join').click();
		}
	}
}

function f_nospam(data){
	API.sendChat("O.O @"+data.from+" ! Deja de hacer spam en esta sala, gracias!");
	API.moderateDeleteChat(data.chatID);
}



function f_announcer(){
	if(o_settings.announcer){
		API.sendChat("/me Enjoying the music and awesome people in this room? Consider joining our facebook group at http://goo.gl/vpHWz and Follow us on twitter @ElectronicELE !");
		window.setTimeout(function(){API.sendChat("/me Also check out the list of banned songs at http://goo.gl/9tLE7 !");},1000);
	}
}
window.setTimeout(function(){f_foxbotInit();},5000);
window.setInterval(function(){f_announcer();},(1000 * 30 * 60));
