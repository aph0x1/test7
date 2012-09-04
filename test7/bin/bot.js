(function() {
  var Command, RoomHelper, User, afkCheck, afksCommand, allAfksCommand, announceCurate, antispam, apiHooks, badQualityCommand, beggar, chatCommandDispatcher, chatUniversals, cmdHelpCommand, cmds, cervezaCommand, data, dieCommand, disconnectLookupCommand, downloadCommand, fbCommand, forceSkipCommand, handleNewSong, handleUserJoin, handleUserLeave, handleVote, hook, initEnvironment, initHooks, initialize, lockCommand, msToStr, overplayedCommand, popCommand, populateUserData, protectCommand, punishCommand, pupOnline, pushCommand, resetAfkCommand, roomHelpCommand, rulesCommand, settings, skipCommand, smokeCommand, statusCommand, swapCommand, themeCommand, undoHooks, unhook, unhookCommand, unlockCommand, updateDjs, updateVotes, wootCommand,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  settings = (function() {

    function settings() {
      this.implode = __bind(this.implode, this);

      this.intervalMessages = __bind(this.intervalMessages, this);

      this.startAfkInterval = __bind(this.startAfkInterval, this);

      this.setInternalWaitlist = __bind(this.setInternalWaitlist, this);

      this.reminderCheck = __bind(this.reminderCheck, this);

      this.userJoin = __bind(this.userJoin, this);

      this.startup = __bind(this.startup, this);

    }

    settings.prototype.currentsong = {};

    settings.prototype.users = {};

    settings.prototype.djs = [];

    settings.prototype.mods = [];

    settings.prototype.host = [];

    settings.prototype.hasWarned = false;

    settings.prototype.currentwoots = 0;

    settings.prototype.currentmehs = 0;

    settings.prototype.currentcurates = 0;

    settings.prototype.internalWaitlist = [];

    settings.prototype.userDisconnectLog = [];

    settings.prototype.voteLog = {};

    settings.prototype.seshOn = false;

    settings.prototype.forceSkip = false;

    settings.prototype.seshMembers = [];

    settings.prototype.launchTime = null;

    settings.prototype.totalVotingData = {
      woots: 0,
      mehs: 0,
      curates: 0
    };

    settings.prototype.pupScriptUrl = 'http://den.johnback.us/js/pup.js';

    settings.prototype.afkTime = 12 * 60 * 1000;

    settings.prototype.songIntervalMessages = [
      {
        interval: 15,
        offset: 0,
        msg: "/fb"
      }, {
        interval: 21,
        offset: 0,
        msg: "Wondering what songs we consider overplayed? Learn more by typing /overplayed"
      }, {
        interval: 19,
        offset: 0,
        msg: "Are you new to the den?  Type /roomhelp to get started."
      }, {
        interval: 17,
        offset: 0,
        msg: "Wondering how the den's Power Users never get removed for being afk? Type /whywoot to find out"
      }, {
        interval: 23,
        offset: 0,
        msg: "Theres a reason Justin Beiber isn't played here. We restrict songs to certain genres. Learn more by typing /theme"
      }, {
        interval: 50,
        offset: 17,
        msg: "Fun fact: 0 of current and past moderators ASKED to be a moderator.  They earned it by being good users.  Shocking, I know."
      }, {
        interval: 100,
        offset: 23,
        msg: "Did you miss our first Promoters Night?  Check out all the songs played that night here: http://goo.gl/fxEek"
      }
    ];

    settings.prototype.reminders = [];

    settings.prototype.songCount = 0;

    settings.prototype.startup = function() {
      return this.launchTime = new Date();
    };

    settings.prototype.newSong = function() {
      this.totalVotingData.woots += this.currentwoots;
      this.totalVotingData.mehs += this.currentmehs;
      this.totalVotingData.curates += this.currentcurates;
      this.setInternalWaitlist();
      this.reminderCheck();
      this.currentsong = API.getMedia();
      if (this.currentsong !== null) {
        return this.currentsong;
      } else {
        return false;
      }
    };

    settings.prototype.userJoin = function(u) {
      var userIds, _ref;
      userIds = Object.keys(this.users);
      if (_ref = u.id, __indexOf.call(userIds, _ref) >= 0) {
        return this.users[u.id].inRoom(true);
      } else {
        this.users[u.id] = new User(u);
        return this.voteLog[u.id] = {};
      }
    };

    settings.prototype.reminderCheck = function() {
      var i, reminder, _i, _len, _ref, _results;
      i = 0;
      _ref = this.reminders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        reminder = _ref[_i];
        console.log('arr > item', this.reminders, this.reminders[i]);
        _results.push(i++);
      }
      return _results;
    };

    settings.prototype.setInternalWaitlist = function() {
      var boothWaitlist, fullWaitList, lineWaitList;
      boothWaitlist = API.getDJs().slice(1);
      lineWaitList = API.getWaitList();
      fullWaitList = boothWaitlist.concat(lineWaitList);
      return this.internalWaitlist = fullWaitList;
    };

    settings.prototype.activity = function(obj) {
      if (obj.type === 'message') {
        return this.users[obj.fromID].updateActivity();
      }
    };

    settings.prototype.startAfkInterval = function() {
      return this.afkInterval = setInterval(afkCheck, 2000);
    };

    settings.prototype.intervalMessages = function() {
      var msg, _i, _len, _ref, _results;
      this.songCount++;
      _ref = this.songIntervalMessages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        msg = _ref[_i];
        if (((this.songCount + msg['offset']) % msg['interval']) === 0) {
          console.log(msg['msg']);
          _results.push(API.sendChat(msg['msg']));
        } else {
          console.log(msg);
          _results.push(console.log(this.songCount));
        }
      }
      return _results;
    };

    settings.prototype.implode = function() {
      var item, val;
      for (item in this) {
        val = this[item];
        if (typeof this[item] === 'object') {
          delete this[item];
        }
      }
      return clearInterval(this.afkInterval);
    };

    settings.prototype.lockBooth = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return $.ajax({
        url: "http://www.plug.dj/gateway/room.update_options",
        type: 'POST',
        data: JSON.stringify({
          service: "room.update_options",
          body: [
            "dubstep-den", {
              "boothLocked": true,
              "waitListEnabled": true,
              "maxPlays": 1,
              "maxDJs": 5
            }
          ]
        }),
        async: this.async,
        dataType: 'json',
        contentType: 'application/json'
      }).done(function() {
        if (callback != null) {
          return callback();
        }
      });
    };

    settings.prototype.unlockBooth = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return $.ajax({
        url: "http://www.plug.dj/gateway/room.update_options",
        type: 'POST',
        data: JSON.stringify({
          service: "room.update_options",
          body: [
            "dubstep-den", {
              "boothLocked": false,
              "waitListEnabled": true,
              "maxPlays": 1,
              "maxDJs": 5
            }
          ]
        }),
        async: this.async,
        dataType: 'json',
        contentType: 'application/json'
      }).done(function() {
        if (callback != null) {
          return callback();
        }
      });
    };

    return settings;

  })();

  data = new settings();

  User = (function() {

    User.prototype.afkWarningCount = 0;

    User.prototype.lastWarning = null;

    User.prototype["protected"] = false;

    User.prototype.isInRoom = true;

    function User(user) {
      this.user = user;
      this.updateVote = __bind(this.updateVote, this);

      this.inRoom = __bind(this.inRoom, this);

      this.notDj = __bind(this.notDj, this);

      this.warn = __bind(this.warn, this);

      this.getIsDj = __bind(this.getIsDj, this);

      this.getWarningCount = __bind(this.getWarningCount, this);

      this.getUser = __bind(this.getUser, this);

      this.getLastWarning = __bind(this.getLastWarning, this);

      this.getLastActivity = __bind(this.getLastActivity, this);

      this.updateActivity = __bind(this.updateActivity, this);

      this.init = __bind(this.init, this);

      this.init();
    }

    User.prototype.init = function() {
      return this.lastActivity = new Date();
    };

    User.prototype.updateActivity = function() {
      this.lastActivity = new Date();
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.getLastActivity = function() {
      return this.lastActivity;
    };

    User.prototype.getLastWarning = function() {
      if (this.lastWarning === null) {
        return false;
      } else {
        return this.lastWarning;
      }
    };

    User.prototype.getUser = function() {
      return this.user;
    };

    User.prototype.getWarningCount = function() {
      return this.afkWarningCount;
    };

    User.prototype.getIsDj = function() {
      var DJs, dj, _i, _len;
      DJs = API.getDJs();
      for (_i = 0, _len = DJs.length; _i < _len; _i++) {
        dj = DJs[_i];
        if (this.user.id === dj.id) {
          return true;
        }
      }
      return false;
    };

    User.prototype.warn = function() {
      this.afkWarningCount++;
      return this.lastWarning = new Date();
    };

    User.prototype.notDj = function() {
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.inRoom = function(online) {
      return this.isInRoom = online;
    };

    User.prototype.updateVote = function(v) {
      if (this.isInRoom) {
        data.voteLog[this.user.id][data.currentsong.id] = v;
        return console.log("Pushed vote(" + v.toString() + ") to " + this.user.username + " for \"" + data.currentsong.title + "\"");
      }
    };

    return User;

  })();

  RoomHelper = (function() {

    function RoomHelper() {}

    RoomHelper.prototype.lookupUser = function(username) {
      var id, u, _ref;
      _ref = data.users;
      for (id in _ref) {
        u = _ref[id];
        if (u.getUser().username === username) {
          return u.getUser();
        }
      }
      return false;
    };

    RoomHelper.prototype.userVoteRatio = function(user) {
      var songId, songVotes, vote, votes;
      console.log("vote log pull for " + user.username + ":", data.voteLog[user.id]);
      songVotes = data.voteLog[user.id];
      votes = {
        'woot': 0,
        'meh': 0
      };
      for (songId in songVotes) {
        vote = songVotes[songId];
        if (vote === 1) {
          votes['woot']++;
        } else if (vote === -1) {
          votes['meh']++;
        }
      }
      votes['positiveRatio'] = (votes['woot'] / (votes['woot'] + votes['meh'])).toFixed(2);
      return votes;
    };

    return RoomHelper;

  })();

  pupOnline = function() {
    return API.sendChat("Bot Activado");
  };

  populateUserData = function() {
    var u, users, _i, _len;
    users = API.getUsers();
    data.djs = API.getDJs();
    data.mods = API.getModerators();
    data.host = API.getHost();
    console.log('Users:', users);
    for (_i = 0, _len = users.length; _i < _len; _i++) {
      u = users[_i];
      data.users[u.id] = new User(u);
      data.voteLog[u.id] = {};
    }
  };

  initEnvironment = function() {
    document.getElementById("button-vote-positive").click();
    document.getElementById("button-sound").click();
    Playback.streamDisabled = true;
    return Playback.stop();
  };

  initialize = function() {
    pupOnline();
    populateUserData();
    initEnvironment();
    initHooks();
    data.startup();
    data.newSong();
    return data.startAfkInterval();
  };

  afkCheck = function() {
    var DJs, id, lastActivity, lastWarned, now, oneMinute, secsLastActive, timeSinceLastActivity, timeSinceLastWarning, twoMinutes, user, warnMsg, _ref, _results;
    _ref = data.users;
    _results = [];
    for (id in _ref) {
      user = _ref[id];
      now = new Date();
      lastActivity = user.getLastActivity();
      timeSinceLastActivity = now.getTime() - lastActivity.getTime();
      if (timeSinceLastActivity > data.afkTime) {
        if (user.getIsDj()) {
          secsLastActive = timeSinceLastActivity / 1000;
          if (user.getWarningCount() === 0) {
            user.warn();
            _results.push(API.sendChat("@" + user.getUser().username + ", No te he visto chatear ni votar en los últimos 12 minutos. Estás AFK?  Si no muestras actividad en 2 minutos, tendré que sacarte."));
          } else if (user.getWarningCount() === 1) {
            lastWarned = user.getLastWarning();
            timeSinceLastWarning = now.getTime() - lastWarned.getTime();
            twoMinutes = 2 * 60 * 1000;
            if (timeSinceLastWarning > twoMinutes) {
              user.warn();
              warnMsg = "@" + user.getUser().username;
              warnMsg += ", No te he visto chatear ni votar en los últimos 14 minutos. Estás AFK?  Si no muestras actividad en 2 minutos, tendré que sacarte.";
              _results.push(API.sendChat(warnMsg));
            } else {
              _results.push(void 0);
            }
          } else if (user.getWarningCount() === 2) {
            lastWarned = user.getLastWarning();
            timeSinceLastWarning = now.getTime() - lastWarned.getTime();
            oneMinute = 1 * 60 * 1000;
            if (timeSinceLastWarning > oneMinute) {
              DJs = API.getDJs();
              if (DJs.length > 0 && DJs[0].id !== user.getUser().id) {
                API.sendChat("@" + user.getUser().username + ", Ya tiénes dos advertencias. Por favor, mantente activo chateando o votando.");
                API.moderateRemoveDJ(id);
                _results.push(user.warn());
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else if (user.getWarningCount() >= 3) {
            _results.push(console.log("Ya se ha intentado removerte " + user.getUser().username + " pero aun sigue en cubierta"));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(user.notDj());
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  msToStr = function(msTime) {
    var ms, msg, timeAway;
    msg = '';
    timeAway = {
      'days': 0,
      'hours': 0,
      'minutes': 0,
      'seconds': 0
    };
    ms = {
      'day': 24 * 60 * 60 * 1000,
      'hour': 60 * 60 * 1000,
      'minute': 60 * 1000,
      'second': 1000
    };
    if (msTime > ms['day']) {
      timeAway['days'] = Math.floor(msTime / ms['day']);
      msTime = msTime % ms['day'];
    }
    if (msTime > ms['hour']) {
      timeAway['hours'] = Math.floor(msTime / ms['hour']);
      msTime = msTime % ms['hour'];
    }
    if (msTime > ms['minute']) {
      timeAway['minutes'] = Math.floor(msTime / ms['minute']);
      msTime = msTime % ms['minute'];
    }
    if (msTime > ms['second']) {
      timeAway['seconds'] = Math.floor(msTime / ms['second']);
    }
    if (timeAway['days'] !== 0) {
      msg += timeAway['days'].toString() + 'd';
    }
    if (timeAway['hours'] !== 0) {
      msg += timeAway['hours'].toString() + 'h';
    }
    if (timeAway['minutes'] !== 0) {
      msg += timeAway['minutes'].toString() + 'm';
    }
    if (timeAway['seconds'] !== 0) {
      msg += timeAway['seconds'].toString() + 's';
    }
    if (msg !== '') {
      return msg;
    } else {
      return false;
    }
  };

  Command = (function() {

    function Command(msgData) {
      this.msgData = msgData;
      this.init();
    }

    Command.prototype.init = function() {
      this.parseType = null;
      this.command = null;
      return this.rankPrivelege = null;
    };

    Command.prototype.functionality = function(data) {};

    Command.prototype.hasPrivelege = function() {
      var user;
      user = data.users[this.msgData.fromID].getUser();
      if (this.rankPrivelege === 'host') {
        if (user.owner) {
          return true;
        } else {
          return false;
        }
      } else if (this.rankPrivelege === 'mod') {
        if (user.owner || user.moderator) {
          return true;
        } else {
          return false;
        }
      } else if (this.rankPrivelege === 'user') {
        return true;
      }
    };

    Command.prototype.commandMatch = function() {
      var command, msg, _i, _len, _ref;
      msg = this.msgData.message;
      if (typeof this.command === 'string') {
        if (this.parseType === 'exact') {
          if (msg === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'startsWith') {
          if (msg.substr(0, this.command.length) === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'contains') {
          if (msg.indexOf(this.command) !== -1) {
            return true;
          } else {
            return false;
          }
        }
      } else if (typeof this.command === 'object') {
        _ref = this.command;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          command = _ref[_i];
          if (this.parseType === 'exact') {
            if (msg === command) {
              return true;
            }
          } else if (this.parseType === 'startsWith') {
            if (msg.substr(0, command.length) === command) {
              return true;
            }
          } else if (this.parseType === 'contains') {
            if (msg.indexOf(command) !== -1) {
              return true;
            }
          }
        }
        return false;
      }
    };

    Command.prototype.evalMsg = function() {
      if (this.commandMatch() && this.hasPrivelege()) {
        this.functionality();
        return true;
      } else {
        return false;
      }
    };

    return Command;

  })();

  protectCommand = (function(_super) {

    __extends(protectCommand, _super);

    function protectCommand() {
      return protectCommand.__super__.constructor.apply(this, arguments);
    }

    protectCommand.prototype.init = function() {
      this.command = '/proteger';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    protectCommand.prototype.functionality = function() {
      var id, msg, user, username, _ref;
      msg = this.msgData.message;
      if (msg.length > 11) {
        username = msg.substring(11);
        _ref = data.users;
        for (id in _ref) {
          user = _ref[id];
          if (user.getUser().username === username) {
            user["protected"] = true;
            API.sendChat("Yo te protegeré @" + username);
            return;
          }
        }
      }
      API.sendChat("Ese nombre no lo he visto");
    };

    return protectCommand;

  })(Command);

  cmdHelpCommand = (function(_super) {

    __extends(cmdHelpCommand, _super);

    function cmdHelpCommand() {
      return cmdHelpCommand.__super__.constructor.apply(this, arguments);
    }

    cmdHelpCommand.prototype.init = function() {
      this.command = '/cmdayuda';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    cmdHelpCommand.prototype.functionality = function() {
      var msg, param, resp;
      msg = this.msgData.message;
      resp = '';
      if (msg.length > 10) {
        param = msg.substring(10);
        switch (param) {
          case "cerveza":
            resp = "Dale una cerveza a otra persona dentro de la sala.  Sintaxis: cerveza @usuario";
            break;
          case "tortura":
            resp = "Castiga a otro usuario con diferentes metodologías. Sintaxis: tortura @usuario";
            break;
          case "/generos":
            resp = "Mira cuáles géneros son aceptables en la sala. No olvides cuáles canciónes ya consideramos /repetidas";
            break;
          case "/reglas":
            resp = "Reglas de la sala.";
            break;
          case "/woot":
            resp = "Hace un recordatorio a los usuarios sobre darle woot. Funciona escibiendo /woot o /woot @usuario";
            break;
          case "/malacalidad":
            resp = "Comando solo para Mod. Saca canciónes que son de malada calidad";
            break;
          case "/descargar":
            resp = "Nos envia un link para bajar la canción que estamos escuchando.";
            break;
          case "/fumar":
            resp = "Comando para los fumadores de la sala.";
            break;
          case "/afks":
            resp = "List current DJs on deck that haven't chatted or voted in 5+ minutes";
            break;
          case "/allafks":
            resp = "List all users in room that haven't chatted or voted in 10+ minutes";
            break;
          case "/estado":
            resp = "Cuando se inicio el bot y estadísticas de las canciónes tocadas.";
            break;
          case "/unhook events all":
            resp = "Host only command.  It's complicated";
            break;
          case "/die":
            resp = "Host only command. Makes bot go bye bye";
            break;
          case "/bloq":
            resp = "Comando solo para Mod. Bloquea la cubierta";
            break;
          case "/desbloq":
            resp = "Comando solo para Mod. Desbloquea la cubierta";
            break;
          case "/repetidas":
            resp = "Lista de las canciónes más repetidas en la sala.";
            break;
          case "/saltar":
            resp = "Comando solo para Mod.  Comando para realizar el salto de djs";
            break;
          case "/resetafk":
            resp = "Mod only command.  Resets AFK timer for user.  Syntax: /resetafk @USER";
            break;
          case "/forceskip":
            resp = "Host only command.  Make pup skip songs when they are supposed to end (addresses triangles of death issue). Syntax: /forceskip [enable|disable]";
            break;
          case "/seguir":
            resp = "Link de nuestra página de facebook";
            break;
          case "/dclookup":
            resp = "Mod only command.  Looks up user for a log of their last disconnect. Syntax: /dclookup @USER";
            break;
          case "/cmdayuda":
            resp = "Ayuda sobre la utilización de los comandos.";
            break;
          case "/ultimo":
            resp = "Comando solo para Mod.  Saca el último dj de la cubierta";
            break;
          case "/poner":
            resp = "Comando solo para Mod.  Coloca a alguien en la cubierta. Sintaxis: /poner @usuario";
            break;
          default:
            resp = "Ese comando no existe";
        }
      } else {
        resp = "Utiliza este comando para saber usar otros comandos.  La sintaxis /cmdayuda + [/comando]";
      }
      return API.sendChat(resp);
    };

    return cmdHelpCommand;

  })(Command);



  cervezaCommand = (function(_super) {

    __extends(cervezaCommand, _super);

    function cervezaCommand() {
      return cervezaCommand.__super__.constructor.apply(this, arguments);
    }

    cervezaCommand.prototype.init = function() {
      this.command = 'cerveza';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    cervezaCommand.prototype.getCerveza = function() {
      var cervezas;
      cervezas = ["rica y deliciosa cerveza"];
      return cervezas;
    };

    cervezaCommand.prototype.functionality = function() {
      var msg, r, user;
      msg = this.msgData.message;
      r = new RoomHelper();
      if (msg.length > 9) {
        user = r.lookupUser(msg.substr(9));
        if (user === false) {
          API.sendChat("/em no ve a  '" + msg.substr(9) + "'en la sala y se la toma el");
          return false;
        } else {
          return API.sendChat("@" + user.username + ", @" + this.msgData.from + " te ha dado una " + this.getCerveza() + ". Disfrutala.");
        }
      }
    };

    return cervezaCommand;

  })(Command);

  punishCommand = (function(_super) {

    __extends(punishCommand, _super);

    function punishCommand() {
      return punishCommand.__super__.constructor.apply(this, arguments);
    }

    punishCommand.prototype.init = function() {
      this.command = 'tortura';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    punishCommand.prototype.getPunishment = function(username) {
      var p, punishment, punishments;
      punishments = ["/me Le pega una patada a @{victim} en sus partes íntimas... ouch!!", "/me Le tira arena en los ojos a @{victim}", "/me Le corta la lengua a @{victim} con una hoja de papel.. huy como debe de doler!!", "/me @{victim} Es obligado a tomar su propio sudor.. daaahh"];
      p = Math.floor(Math.random() * punishments.length);
      punishment = punishments[p].replace('{victim}', username);
      return punishment;
    };

    punishCommand.prototype.functionality = function() {
      var msg, name, r, user;
      msg = this.msgData.message;
      r = new RoomHelper();
      if (msg.length > 9) {
        name = msg.substr(9);
        user = r.lookupUser(name);
        if (user === false) {
          API.sendChat("/me tortura @" + this.msgData.from + " por haber cometido un error.");
          return setTimeout(function() {
            return API.sendChat("No reconozco el nombre de usuario  '" + name + "'");
          }, 750);
        } else {
          if (user.owner) {
            return API.sendChat(this.getPunishment(this.msgData.from));
          } else {
            return API.sendChat(this.getPunishment(user.username));
          }
        }
      }
    };

    return punishCommand;

  })(Command);




  themeCommand = (function(_super) {

    __extends(themeCommand, _super);

    function themeCommand() {
      return themeCommand.__super__.constructor.apply(this, arguments);
    }

    themeCommand.prototype.init = function() {
      this.command = '/generos';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    themeCommand.prototype.functionality = function() {
      var msg;
      msg = "Cualquier género o subgénero perteneciente a la música electrónica es permitido aquí, ejemplos: ";
      msg += "House, Industrial, Jungle, Dubstep, Drum and Bass, Minimal, Trance, Hardstyle, entre otros.";
      return API.sendChat(msg);
    };

    return themeCommand;

  })(Command);

  rulesCommand = (function(_super) {

    __extends(rulesCommand, _super);

    function rulesCommand() {
      return rulesCommand.__super__.constructor.apply(this, arguments);
    }

    rulesCommand.prototype.init = function() {
      this.command = '/reglas';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    rulesCommand.prototype.functionality = function() {
      var msg;
      msg = "Poner música de buena calidad ";
      msg += "No repitas canciónes que ya fueron tocadas, para ello mira siempre el historial.";
      return API.sendChat(msg);
    };

    return rulesCommand;

  })(Command);

  roomHelpCommand = (function(_super) {

    __extends(roomHelpCommand, _super);

    function roomHelpCommand() {
      return roomHelpCommand.__super__.constructor.apply(this, arguments);
    }

    roomHelpCommand.prototype.init = function() {
      this.command = '/ayuda';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    roomHelpCommand.prototype.functionality = function() {
      var msg1, msg2;
      msg1 = "Bienvenido a Latin Force!, Crea una lista de reproducción y agrega música ya sea de Youtube como de Soundcloud  ";
      msg1 += "Dale click al botón 'Join Waitlist' y espera tu turno para tocar. Para saber que tocar escribe '/géneros' para más especificaciónes.";
      API.sendChat(msg1);
      return setTimeout((function() {
        return API.sendChat(msg2);
      }), 750);
    };

    return roomHelpCommand;

  })(Command);


  wootCommand = (function(_super) {

    __extends(wootCommand, _super);

    function wootCommand() {
      return wootCommand.__super__.constructor.apply(this, arguments);
    }

    wootCommand.prototype.init = function() {
      this.command = '/woot';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    wootCommand.prototype.functionality = function() {
      var msg, nameIndex;
      msg = "Por favor dale Woot y sigue a los DJs!";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return wootCommand;

  })(Command);


    comandosCommand = (function(_super) {

    __extends(comandosCommand, _super);

    function comandosCommand() {
      return comandosCommand.__super__.constructor.apply(this, arguments);
    }

    comandosCommand.prototype.init = function() {
      this.command = '/comandos';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    comandosCommand.prototype.functionality = function() {
      var msg, nameIndex;
      msg = "|cerveza|tortura |generos |reglas |woot |malacalidad |descargar |fumar |estado |bloq |desbloq |repetidas |saltar |forceskip |seguir |cmdayuda |ultimo |poner";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return comandosCommand;

  })(Command);

  badQualityCommand = (function(_super) {

    __extends(badQualityCommand, _super);

    function badQualityCommand() {
      return badQualityCommand.__super__.constructor.apply(this, arguments);
    }

    badQualityCommand.prototype.init = function() {
      this.command = '/malacalidad';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    badQualityCommand.prototype.functionality = function() {
      var msg;
      msg = "Has sido removido por que la canción es de pésima calidad. Por favor no pongas más canciónes de baja calidad";
      return API.sendChat(msg);
    };

    return badQualityCommand;

  })(Command);

  downloadCommand = (function(_super) {

    __extends(downloadCommand, _super);

    function downloadCommand() {
      return downloadCommand.__super__.constructor.apply(this, arguments);
    }

    downloadCommand.prototype.init = function() {
      this.command = '/descargar';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    downloadCommand.prototype.functionality = function() {
      var e, eAuthor, eTitle, msg;
      e = encodeURIComponent;
      eAuthor = e(data.currentsong.author);
      eTitle = e(data.currentsong.title);
      msg = "Prueba este link: http://google.com/#hl=en&q=";
      msg += eAuthor + "%20-%20" + eTitle;
      msg += "site%3Asoundcloud.com";
      return API.sendChat(msg);
    };

    return downloadCommand;

  })(Command);

  smokeCommand = (function(_super) {

    __extends(smokeCommand, _super);

    function smokeCommand() {
      return smokeCommand.__super__.constructor.apply(this, arguments);
    }

    smokeCommand.prototype.init = function() {
      this.command = ['/fumar'];
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    smokeCommand.prototype.smoke = function() {
      var r;
      r = Math.floor(Math.random() * this.responses.length);
      return this.responses[r];
    };

    smokeCommand.prototype.functionality = function() {
      return API.sendChat(this.smoke());
    };

    smokeCommand.prototype.responses = ["/me ¿Para que beber y conducir, si puedes fumar y volar? yeah!", "/me Dejame armarte el cigarro compañero!", "/me Ohhhh veo colores!!! colores!!!! los coloreeeeees", "/me Cof Cof Cof!!", "/me Todo esta bien..... amor y paz"];

    return smokeCommand;

  })(Command);

  afksCommand = (function(_super) {

    __extends(afksCommand, _super);

    function afksCommand() {
      return afksCommand.__super__.constructor.apply(this, arguments);
    }

    afksCommand.prototype.init = function() {
      this.command = '/afks';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    afksCommand.prototype.functionality = function() {
      var dj, djAfk, djs, msg, now, _i, _len;
      msg = '';
      djs = API.getDJs();
      for (_i = 0, _len = djs.length; _i < _len; _i++) {
        dj = djs[_i];
        now = new Date();
        djAfk = now.getTime() - data.users[dj.id].getLastActivity().getTime();
        if (djAfk > (5 * 60 * 1000)) {
          if (msToStr(djAfk) !== false) {
            msg += dj.username + ' - ' + msToStr(djAfk);
            msg += '. ';
          }
        }
      }
      if (msg === '') {
        return API.sendChat("Nadie está AFK");
      } else {
        return API.sendChat('AFKs: ' + msg);
      }
    };

    return afksCommand;

  })(Command);

  allAfksCommand = (function(_super) {

    __extends(allAfksCommand, _super);

    function allAfksCommand() {
      return allAfksCommand.__super__.constructor.apply(this, arguments);
    }

    allAfksCommand.prototype.init = function() {
      this.command = '/allafks';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    allAfksCommand.prototype.functionality = function() {
      var msg, now, u, uAfk, usrs, _i, _len;
      msg = '';
      usrs = API.getUsers();
      for (_i = 0, _len = usrs.length; _i < _len; _i++) {
        u = usrs[_i];
        now = new Date();
        uAfk = now.getTime() - data.users[u.id].getLastActivity().getTime();
        if (uAfk > (10 * 60 * 1000)) {
          if (msToStr(uAfk) !== false) {
            msg += u.username + ' - ' + msToStr(uAfk);
            msg += '. ';
          }
        }
      }
      if (msg === '') {
        return API.sendChat("Nadie está AFK");
      } else {
        return API.sendChat('AFKs: ' + msg);
      }
    };

    return allAfksCommand;

  })(Command);

  statusCommand = (function(_super) {

    __extends(statusCommand, _super);

    function statusCommand() {
      return statusCommand.__super__.constructor.apply(this, arguments);
    }

    statusCommand.prototype.init = function() {
      this.command = '/estado';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    statusCommand.prototype.functionality = function() {
      var day, hour, launch, lt, meridian, min, month, msg, t, totals;
      lt = data.launchTime;
      month = lt.getMonth() + 1;
      day = lt.getDate();
      hour = lt.getHours();
      meridian = hour % 12 === hour ? 'AM' : 'PM';
      min = lt.getMinutes();
      min = min < 10 ? '0' + min : min;
      t = data.totalVotingData;
      t['songs'] = data.songCount;
      launch = 'Iniciado el  ' + month + '/' + day + ' ' + hour + ':' + min + ' ' + meridian + '. ';
      totals = '' + t.songs + ' canciónes han sido tocadas, Acumulando un total de:  ' + t.woots + ' woots, ' + t.mehs + ' mehs, y ' + t.curates + ' queues.';
      msg = launch + totals;
      return API.sendChat(msg);
    };

    return statusCommand;

  })(Command);

  unhookCommand = (function(_super) {

    __extends(unhookCommand, _super);

    function unhookCommand() {
      return unhookCommand.__super__.constructor.apply(this, arguments);
    }

    unhookCommand.prototype.init = function() {
      this.command = '/unhook events all';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    unhookCommand.prototype.functionality = function() {
      API.sendChat('Unhooking all events...');
      return undoHooks();
    };

    return unhookCommand;

  })(Command);

  dieCommand = (function(_super) {

    __extends(dieCommand, _super);

    function dieCommand() {
      return dieCommand.__super__.constructor.apply(this, arguments);
    }

    dieCommand.prototype.init = function() {
      this.command = '/die';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    dieCommand.prototype.functionality = function() {
      API.sendChat('Unhooking Events...');
      undoHooks();
      API.sendChat('Deleting bot data...');
      data.implode();
      return API.sendChat('Consider me dead');
    };

    return dieCommand;

  })(Command);



  lockCommand = (function(_super) {

    __extends(lockCommand, _super);

    function lockCommand() {
      return lockCommand.__super__.constructor.apply(this, arguments);
    }

    lockCommand.prototype.init = function() {
      this.command = '/lock';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    lockCommand.prototype.functionality = function() {
      return data.lockBooth();
    };

    return lockCommand;

  })(Command);

  unlockCommand = (function(_super) {

    __extends(unlockCommand, _super);

    function unlockCommand() {
      return unlockCommand.__super__.constructor.apply(this, arguments);
    }

    unlockCommand.prototype.init = function() {
      this.command = '/unlock';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    unlockCommand.prototype.functionality = function() {
      return data.unlockBooth();
    };

    return unlockCommand;

  })(Command);

  swapCommand = (function(_super) {

    __extends(swapCommand, _super);

    function swapCommand() {
      return swapCommand.__super__.constructor.apply(this, arguments);
    }

    swapCommand.prototype.init = function() {
      this.command = '/cambiar';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    swapCommand.prototype.functionality = function() {
      var msg, r, swapRegex, userAdd, userRemove, users;
      msg = this.msgData.message;
      swapRegex = new RegExp("^/cambiar @(.+) por @(.+)$");
      users = swapRegex.exec(msg).slice(1);
      r = new RoomHelper();
      if (users.length === 2) {
        userRemove = r.lookupUser(users[0]);
        userAdd = r.lookupUser(users[1]);
        if (userRemove === false || userAdd === false) {
          API.sendChat('Error en los nombres de usuario');
          console.log('Err users', users, userRemove, userAdd);
          return false;
        } else {
          return data.lockBooth(function() {
            API.moderateRemoveDJ(userRemove.id);
            API.sendChat("Sacando a " + userRemove.username + "...");
            return setTimeout(function() {
              API.moderateAddDJ(userAdd.id);
              API.sendChat("Agregando a " + userAdd.username + "...");
              return setTimeout(function() {
                return data.unlockBooth();
              }, 1500);
            }, 1500);
          });
        }
      } else {
        return API.sendChat("EL comando no funciona si hay nombres de usuarios separados");
      }
    };

    return swapCommand;

  })(Command);

  popCommand = (function(_super) {

    __extends(popCommand, _super);

    function popCommand() {
      return popCommand.__super__.constructor.apply(this, arguments);
    }

    popCommand.prototype.init = function() {
      this.command = '/ultimo';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    popCommand.prototype.functionality = function() {
      var djs, popDj;
      djs = API.getDJs();
      popDj = djs[djs.length - 1];
      return API.moderateRemoveDJ(popDj.id);
    };

    return popCommand;

  })(Command);

  pushCommand = (function(_super) {

    __extends(pushCommand, _super);

    function pushCommand() {
      return pushCommand.__super__.constructor.apply(this, arguments);
    }

    pushCommand.prototype.init = function() {
      this.command = '/poner';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    pushCommand.prototype.functionality = function() {
      var msg, name, r, user;
      msg = this.msgData.message;
      if (msg.length > this.command.length + 2) {
        name = msg.substr(this.command.length + 2);
        r = new RoomHelper();
        user = r.lookupUser(name);
        if (user !== false) {
          API.moderateAddDJ(user.id);
          return console.log("Agregando usuario a la cabina", user);
        } else {
          return console.log("No se encontró el usuario de nombre " + name);
        }
      }
    };

    return pushCommand;

  })(Command);

  resetAfkCommand = (function(_super) {

    __extends(resetAfkCommand, _super);

    function resetAfkCommand() {
      return resetAfkCommand.__super__.constructor.apply(this, arguments);
    }

    resetAfkCommand.prototype.init = function() {
      this.command = '/resetafk';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    resetAfkCommand.prototype.functionality = function() {
      var id, name, u, _ref;
      if (this.msgData.message.length > 10) {
        name = this.msgData.message.substring(11);
        _ref = data.users;
        for (id in _ref) {
          u = _ref[id];
          if (u.getUser().username === name) {
            u.updateActivity();
            API.sendChat('@' + u.getUser().username + '\'s AFK time has been reset.');
            return;
          }
        }
        API.sendChat('Not sure who ' + name + ' is');
      } else {
        API.sendChat('Yo Gimme a name r-tard');
      }
    };

    return resetAfkCommand;

  })(Command);

  forceSkipCommand = (function(_super) {

    __extends(forceSkipCommand, _super);

    function forceSkipCommand() {
      return forceSkipCommand.__super__.constructor.apply(this, arguments);
    }

    forceSkipCommand.prototype.init = function() {
      this.command = '/forceskip';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    forceSkipCommand.prototype.functionality = function() {
      var msg, param;
      msg = this.msgData.message;
      if (msg.length > 11) {
        param = msg.substr(11);
        if (param === 'activar') {
          data.forceSkip = true;
          return API.sendChat("La opción de forzar salto ha sido activada.");
        } else if (param === 'desactivar') {
          data.forceSkip = false;
          return API.sendChat("La opción de forzar salto ha sido desactivada. ");
        }
      }
    };

    return forceSkipCommand;

  })(Command);

  fbCommand = (function(_super) {

    __extends(fbCommand, _super);

    function fbCommand() {
      return fbCommand.__super__.constructor.apply(this, arguments);
    }

    fbCommand.prototype.init = function() {
      this.command = '/seguir';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    fbCommand.prototype.functionality = function() {
      var m, msg;
      m = Math.floor(Math.random() * this.msgs.length);
      msg = this.msgs[m].replace('{seguir}', 'http://goo.gl/9WBbZ');
      return API.sendChat(msg);
    };

    fbCommand.prototype.msgs = ["Unete a nuestro grupo de FB: {seguir}", "¿Quiéres saber cuando hacemos algun evento? síguenos: {seguir} y enterate de todo!"];

    return fbCommand;

  })(Command);

  overplayedCommand = (function(_super) {

    __extends(overplayedCommand, _super);

    function overplayedCommand() {
      return overplayedCommand.__super__.constructor.apply(this, arguments);
    }

    overplayedCommand.prototype.init = function() {
      this.command = '/repetidas';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    overplayedCommand.prototype.functionality = function() {
      return API.sendChat("Mira la lista de canciónes que consideramos repetidas: http://www.google.com");
    };

    return overplayedCommand;

  })(Command);


  skipCommand = (function(_super) {

    __extends(skipCommand, _super);

    function skipCommand() {
      return skipCommand.__super__.constructor.apply(this, arguments);
    }

    skipCommand.prototype.init = function() {
      this.command = '/saltar';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    skipCommand.prototype.functionality = function() {
      return API.moderateForceSkip();
    };

    return skipCommand;

  })(Command);



  disconnectLookupCommand = (function(_super) {

    __extends(disconnectLookupCommand, _super);

    function disconnectLookupCommand() {
      return disconnectLookupCommand.__super__.constructor.apply(this, arguments);
    }

    disconnectLookupCommand.prototype.init = function() {
      this.command = '/dclookup';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    disconnectLookupCommand.prototype.functionality = function() {
      var cmd, dcHour, dcLookupId, dcMeridian, dcMins, dcSongsAgo, dcTimeStr, dcUser, disconnectInstances, givenName, id, recentDisconnect, resp, u, _i, _len, _ref, _ref1;
      cmd = this.msgData.message;
      if (cmd.length > 11) {
        givenName = cmd.slice(11);
        _ref = data.users;
        for (id in _ref) {
          u = _ref[id];
          if (u.getUser().username === givenName) {
            dcLookupId = id;
            disconnectInstances = [];
            _ref1 = data.userDisconnectLog;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              dcUser = _ref1[_i];
              if (dcUser.id === dcLookupId) {
                disconnectInstances.push(dcUser);
              }
            }
            if (disconnectInstances.length > 0) {
              resp = u.getUser().username + ' has disconnected ' + disconnectInstances.length.toString() + ' time';
              if (disconnectInstances.length === 1) {
                resp += '. ';
              } else {
                resp += 's. ';
              }
              recentDisconnect = disconnectInstances.pop();
              dcHour = recentDisconnect.time.getHours();
              dcMins = recentDisconnect.time.getMinutes();
              if (dcMins < 10) {
                dcMins = '0' + dcMins.toString();
              }
              dcMeridian = dcHour % 12 === dcHour ? 'AM' : 'PM';
              dcTimeStr = '' + dcHour + ':' + dcMins + ' ' + dcMeridian;
              dcSongsAgo = data.songCount - recentDisconnect.songCount;
              resp += 'Their most recent disconnect was at ' + dcTimeStr + ' (' + dcSongsAgo + ' songs ago). ';
              if (recentDisconnect.waitlistPosition !== void 0) {
                resp += 'They were ' + recentDisconnect.waitlistPosition + ' song';
                if (recentDisconnect.waitlistPosition > 1) {
                  resp += 's';
                }
                resp += ' away from the DJ booth.';
              } else {
                resp += 'They were not on the waitlist.';
              }
              API.sendChat(resp);
              return;
            } else {
              API.sendChat("I haven't seen " + u.getUser().username + " disconnect.");
              return;
            }
          }
        }
        return API.sendChat("I don't see a user in the room named '" + givenName + "'.");
      }
    };

    return disconnectLookupCommand;

  })(Command);


  cmds = [cervezaCommand, punishCommand, themeCommand, rulesCommand, roomHelpCommand, wootCommand, comandosCommand, badQualityCommand, downloadCommand, smokeCommand, afksCommand, allAfksCommand, statusCommand, unhookCommand, dieCommand, lockCommand, unlockCommand, swapCommand, popCommand, pushCommand, overplayedCommand, skipCommand, resetAfkCommand, forceSkipCommand, fbCommand, cmdHelpCommand, protectCommand, disconnectLookupCommand];

  chatCommandDispatcher = function(chat) {
    var c, cmd, _i, _len, _results;
    chatUniversals(chat);
    _results = [];
    for (_i = 0, _len = cmds.length; _i < _len; _i++) {
      cmd = cmds[_i];
      c = new cmd(chat);
      if (c.evalMsg()) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  updateVotes = function(obj) {
    data.currentwoots = obj.positive;
    data.currentmehs = obj.negative;
    return data.currentcurates = obj.curates;
  };

  announceCurate = function(obj) {
    return API.sendChat("/em: A " + obj.user.username + " Le gusta esta canción!");
  };

  updateDjs = function(obj) {
    return data.djs = API.getDJs();
  };

  handleUserJoin = function(user) {
    data.host = API.getHost();
    data.mods = API.getModerators();
    data.userJoin(user);
    data.users[user.id].updateActivity();
    console.log(user.username + " joined the room");
    return API.sendChat("/em: " + user.username + " Ha ingresado a la sala.");
  };

  handleNewSong = function(obj) {
    var songId;
    data.intervalMessages();
    if (data.currentsong === null) {
      data.newSong();
    } else {
      API.sendChat("/em: Hemos escuchado: " + data.currentsong.title + " por " + data.currentsong.author + ". Estadísticas: Woots: " + data.currentwoots + ", Mehs: " + data.currentmehs + ", Me Gusta: " + data.currentcurates + ".");
      data.newSong();
      document.getElementById("button-vote-positive").click();
    }
    if (data.forceSkip) {
      songId = obj.media.id;
      return setTimeout(function() {
        var cMedia;
        cMedia = API.getMedia();
        if (cMedia.id === songId) {
          return API.moderateForceSkip();
        }
      }, obj.media.duration * 1000);
    }
  };

  handleVote = function(obj) {
    data.users[obj.user.id].updateActivity();
    return data.users[obj.user.id].updateVote(obj.vote);
  };

  handleUserLeave = function(user) {
    var disconnectStats, i, u, _i, _len, _ref;
    data.host = API.getHost();
    data.mods = API.getModerators();
    console.log(user.username + " left the room");
    disconnectStats = {
      id: user.id,
      time: new Date(),
      songCount: data.songCount
    };
    i = 0;
    _ref = data.internalWaitlist;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      if (u.id === user.id) {
        disconnectStats['waitlistPosition'] = i - 1;
        data.setInternalWaitlist();
        break;
      } else {
        i++;
      }
    }
    data.userDisconnectLog.push(disconnectStats);
    console.log('User disconnect logged', data.userDisconnectLog);
    return data.users[user.id].inRoom(false);
  };

  antispam = function(chat) {
    var plugRoomLinkPatt, sender;
    plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    if (plugRoomLinkPatt.exec(chat.message)) {
      sender = API.getUser(chat.fromID);
      if (!sender.ambassador && !sender.moderator && !sender.owner && !sender.superuser) {
        if (!data.users[chat.fromID]["protected"]) {
          API.sendChat("No hagas spam!! ");
          return API.moderateDeleteChat(chat.chatID);
        } else {
          return API.sendChat("I'm supposed to kick you, but you're just too darn pretty.");
        }
      }
    }
  };

  beggar = function(chat) {
    var msg, r, responses;
    msg = chat.message.toLowerCase();
    responses = ["Good idea @{beggar}!  Don't earn your fans or anything thats so yesterday", "Guys @{beggar} asked us to fan him!  Lets all totally do it! ಠ_ಠ", "srsly @{beggar}? ಠ_ಠ", "@{beggar}.  Earning his fans the good old fashioned way.  Hard work and elbow grease.  A true american."];
    r = Math.floor(Math.random() * responses.length);
    if (msg.indexOf('fan me') !== -1 || msg.indexOf('fan for fan') !== -1 || msg.indexOf('fan pls') !== -1 || msg.indexOf('fan4fan') !== -1 || msg.indexOf('add me to fan') !== -1) {
      return API.sendChat(responses[r].replace("{beggar}", chat.from));
    }
  };

  chatUniversals = function(chat) {
    data.activity(chat);
    antispam(chat);
    return beggar(chat);
  };

  hook = function(apiEvent, callback) {
    return API.addEventListener(apiEvent, callback);
  };

  unhook = function(apiEvent, callback) {
    return API.removeEventListener(apiEvent, callback);
  };

  apiHooks = [
    {
      'event': API.ROOM_SCORE_UPDATE,
      'callback': updateVotes
    }, {
      'event': API.CURATE_UPDATE,
      'callback': announceCurate
    }, {
      'event': API.DJ_UPDATE,
      'callback': updateDjs
    }, {
      'event': API.USER_JOIN,
      'callback': handleUserJoin
    }, {
      'event': API.DJ_ADVANCE,
      'callback': handleNewSong
    }, {
      'event': API.VOTE_UPDATE,
      'callback': handleVote
    }, {
      'event': API.CHAT,
      'callback': chatCommandDispatcher
    }, {
      'event': API.USER_LEAVE,
      'callback': handleUserLeave
    }
  ];

  initHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(hook(pair['event'], pair['callback']));
    }
    return _results;
  };

  undoHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(unhook(pair['event'], pair['callback']));
    }
    return _results;
  };

  initialize();

}).call(this);
