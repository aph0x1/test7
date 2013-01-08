
var o_settings = {
    	autoSkip: true,
    	autoWoot: true,
    	autoQueue: true,
    	welcomeMsg: true,
    	goodbyeMsg: true,
	profanityfilter: false,
	announcer: true,
	maxSongLength: 8, // in mins.
    	reglas: 'Cualquier género de música es permitido aquí, no superar el maximo de 8 min 8 min. Por favor muestra respeto con todos!',
    	welcome: 'Bienvenido a ForoCoches',
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

	'/commands': {
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



//Begin Function Declarations
function f_foxbotInit() {
	API.sendChat('/me  El Bot de ForoCoches ha sido activado satisfactoriamente');
	b_hasModRights = API.getSelf().permission.toString()>1;
	// now all the event listeners
	API.addEventListener(API.USER_JOIN, join);
	API.addEventListener(API.USER_LEAVE, leave);
	API.addEventListener("curateUpdate", f_curate);
	API.addEventListener(API.CHAT, f_checkChat);
	API.addEventListener(API.DJ_ADVANCE, f_djAdvance);
	// mute the player
	Playback.setVolume(0);
}
function join(user){
	if(user.id=="50aeb20fc3b97a2cb4c2d804"){
		API.sendChat("/me :: All hail our Extreme Overlord, @"+user.username+" ! Welcome back master!");
	}
	else if(user.permission.toString()>1){
		API.sendChat("/me :: A wild moderator appears! Wait, no. We know this one. The moderator's name is "+user.username+" . Well, that was anticlimactic. Now back to regular programming");
	}
	else{
		API.sendChat("/me :: Bienvenido @" + user.username + " a " + Models.room.data.name + ". "+o_settings.welcome);
		//window.setTimeout(function(){f_rule({from: user.username});}, 1000); //Uncomment to send rules
	}
}


function leave(user){
	if(user.id=="50aeb20fc3b97a2cb4c2d804"){
		API.sendChat("/me :: All hail our Extreme Overlord, @"+user.username+" ! Thank you for gracing us with your presence!");
	}
	else if(user.permission.toString()>1){
		API.sendChat("/me :: Bye bye, Mr. Moderator, sir! Bye @"+user.username+" !");
	}
	else if(user.permission.toString()==1){
		API.sendChat("/me :: [Featured DJ]"+user.username+" has left the room");
	}
}


function f_curate(data){
	API.sendChat("/me " + data.user.username + " Le gusta esta canción");
}
function f_commands(data){
	var cmds = '';
	for(var cmd in o_chatcmds){
		if(o_chatcmds[cmd].visible){
			cmds = cmds + cmd + ', ';
		}
	}
	cmds_clean = cmds.slice(0, -2);
	API.sendChat('/me Los comandos soportados son: '+cmds_clean);
}

function f_skip(data) {
    API.sendChat('/me Se ha saltado el turno del dj');
    window.setTimeout(function(){new ModerationForceSkipService(Models.room.data.historyID);}, 1000);
	window.setTimeout(function(){API.sendChat("/me Tu canción ha sido saltada debido a que no es un género permitido en la sala, es muy escuchada o demasiada larga");}, 2000);
}
function f_long() {
	API.sendChat('@'+o_tmp.username+' Tu canción ha sido puesta anteriormente por  '+o_settings.maxSongLength+' minutos atras, por ese motivo se saltara tu turno');
    window.setTimeout(function(){new ModerationForceSkipService(Models.room.data.historyID);}, 1000);
}
function f_lock(data) {
        API.sendChat('/me La cabina de dj ha sido cerrada');
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
	API.sendChat('/me La cabina de dj ha sido habilitada nuevamente');
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



function f_rule(data) {
	API.sendChat('/me Reglas: '+o_settings.rules);
}





function f_userIntentLeave(data) {
	API.sendChat('@'+data.from+': Espero que te haya gustado estar en nuestra sala, visitanos pronto');
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
			API.sendChat('@'+o_tmp.username+' Lo siento tu canción supera el límite de minutos, tu turno se terminará automaticamente dentro de '+o_settings.maxSongLength+' minutos.');
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
	API.sendChat("O.O, @"+data.from+" ! Deja de promocionar otras salas aqui, gracias!");
	API.moderateDeleteChat(data.chatID);
}

/*function f_announcer(){
	if(o_settings.announcer){
		API.sendChat("/me Enjoying the music and awesome people in this room? Consider joining our facebook group at http://goo.gl/vpHWz and Follow us on twitter @ElectronicELE !");
		window.setTimeout(function(){API.sendChat("/me Also check out the list of banned songs at http://goo.gl/9tLE7 !");},1000);
	}
}
*/
window.setTimeout(function(){f_foxbotInit();},5000);
window.setInterval(function(){f_announcer();},(1000 * 30 * 60));
