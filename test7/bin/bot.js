var o_settings = {
    	autoSkip: true,
    	autoWoot: true,
    	autoQueue: true,
    	welcomeMsg: true,
    	goodbyeMsg: true,
	profanityfilter: false,
	announcer: true,
	maxSongLength: 8, // in mins.
    	rules: 'Cualquier género de música es permitido, no superar los 8min. Muestra respeto a todos en la sala',
    	welcome: '',
	strictMode: false,
	i_timerID: null,
	f_autoSkip: f_long
};

var o_tmp = {};
var b_hasModRights = false;
var cur_Vers="101.12.13.2.1";

var o_chatcmds = {

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





	'plug.dj/': {
		f: f_nospam,
		needsPerm: false,
		visible: false
	},	

      
};



function f_foxbotInit() {
	API.sendChat('/me El bot ha sido activado');
	b_hasModRights = API.getSelf().permission.toString()>1;

	API.addEventListener(API.USER_JOIN, join);
	API.addEventListener("curateUpdate", f_curate);
	API.addEventListener(API.CHAT, f_checkChat);
	API.addEventListener(API.DJ_ADVANCE, f_djAdvance);

	Playback.setVolume(0);
}
function join(user){
	if(user.id=="50aeb179d6e4a94f77477687"){
		API.sendChat("/me :: Ohhh acaba de ingresar mi creador a la sala!!, @"+user.username+" ! Bienvenido mi señor.");
	}
		if(user.id=="51197183d6e4a91d9e5c6aa7"){
		API.sendChat("/me :: Ohhh acaba de entrar el mas macho macho man! saluden a, @"+user.username+" !.");
	}
			if(user.id=="5113124d96fba52aafa973e9"){
		API.sendChat("/me :: Ya llego por quien lloraban runchas!!  @"+user.username+" !.");
	}
	else if(user.permission.toString()>1){
		API.sendChat("/me :: Acaba de ingresar un moderador a la sala!!. El nombre del moderador es  "+user.username+" . Venga, saludenlo!");
	}
	
	else{
		API.sendChat("/me :: Bienvenido @" + user.username + " a " + Models.room.data.name + ". "+o_settings.welcome);
	
	}
}




function f_curate(data){
	API.sendChat("/me A " + data.user.username + " le orgasmea esta canción");
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
	API.sendChat('@'+o_tmp.username+' Tu canción ha estado por  '+o_settings.maxSongLength+' minutos y ahora sera quitada.');
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
	);}, 5000); 
}	


function f_rule(data) {
	API.sendChat('/me Reglas: '+o_settings.rules);
}












function f_checkChat(data) {

	if((data.type == "message") && (data.fromID != API.getSelf().id) ) {
		for(var s in o_chatcmds) {
			if(data.message.toString().toLowerCase().indexOf(s) != -1) { 
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
    var a_s = s.split(' '); 
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

	while(s_timeRem == null){
		s_timeRem = jQuery('#time-remaining-value').text();
	}
	a_timeRem = s_timeRem.toString().split(':');
	if (a_timeRem.length<3){

		i_timeRem = parseInt(a_timeRem[0]*60) + parseInt(a_timeRem[1]*1);
	}

	window.clearTimeout(o_settings.i_timerID);

	if(o_settings.autoSkip && ((i_timeRem > (o_settings.maxSongLength)*60)|| (a_timeRem.length>2))){

		if(o_settings.strictMode){
			var o_djs = API.getDJs();
		o_tmp.username = o_djs[0].username;
		f_long();
		}
		else {
	
			var o_djs = API.getDJs();
			o_tmp.username = o_djs[0].username;
			API.sendChat('@'+o_tmp.username+' [ADVERTENCIA] Perdon, pero tu canción supera el limite de minutos permitido en esta sala, tu canción sera quitada automaticamente dentro de '+o_settings.maxSongLength+' minutos.');
			o_settings.i_timerID = window.setTimeout(o_settings.f_autoSkip, (o_settings.maxSongLength)*60*1000);
		}
	}

	if(o_settings.autoWoot) {
		jQuery("#button-vote-positive").click();
	}



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





window.setTimeout(function(){f_foxbotInit();},5000);
