'use strict' ;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server, { log: false });
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const routes = require('./routes/index');
const room = require('./routes/server_room');

// const sockets = require('./sockets/sockets');
const PORT = process.env.PORT || 8000;

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'favicon.ico')));
// app.use('/favicon.ico', express.static('favicon.ico'));

app.use('/', routes);
app.use('/room', room);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// socketの設定
let battleData = {};
const match = io.of('/match').on('connection', (socket) => {
  socket.on('match', (data) => {
    socket.deleteRoomId = data.nextGame ? socket.roomId : '';
    socket.roomId = data.userId;
    socket.userId = data.userId;
    socket.oldUserId = data.oldUserId;
    socket.userName = data.userName ? data.userName : 'No Name';
    socket.character = data.character ? data.character : 'hatnychan';
    socket.roomMakeFlag = 1;

    Object.keys(battleData).some((key) => {
      if (Object.keys(battleData[key]).length === 1) {
        socket.userIds = Object.keys(battleData[key]) ;
        for (let i of socket.userIds) {
          if (i !== socket.userId) {
            socket.opponentId = i;
          }
        }
        if (socket.oldUserId !== battleData[key] [socket.opponentId] ['userId']) {
          socket.roomId = key;
            battleData[socket.roomId] [socket.opponentId] ['sakemajin'] = '';
          battleData[socket.roomId] [socket.userId] = {
            roomId: socket.roomId,
            userId: socket.userId,
            userName: socket.userName,
            character: socket.character,
            sakemajin: '',
            power: 0,
            enchantPower: 0,
            enchant1: 0,
            enchant2: 0,
            enchant3: 0
          };
          socket.roomMakeFlag = 0;
          return true;
        }
      }
    });

    if (socket.roomMakeFlag === 1) {
      battleData[socket.roomId] = {
          [socket.userId]: {
            roomId: socket.roomId,
            userId: socket.userId,
            userName: socket.userName,
            character: socket.character,
            sakemajin: '',
            power: 0,
            enchantPower: 0,
            enchant1: 0,
            enchant2: 0,
            enchant3: 0
          }
      };
    }

    if (data.nextGame === 1) {
      delete battleData[socket.deleteRoomId] [socket.oldUserId];
      if (Object.keys(battleData[socket.deleteRoomId]).length === 0) {
        delete battleData[socket.deleteRoomId];
      }
      socket.leave(socket.deleteRoomId);
      io.of('/match').to(socket.deleteRoomId).emit('match', battleData[socket.deleteRoomId]);
    }

    socket.join(socket.roomId);
    io.of('/match').to(socket.roomId).emit('match', battleData[socket.roomId]);
  });

  socket.on('setSakemajin', (data) => {
    battleData[socket.roomId] [socket.userId] ['sakemajin'] = data.sakemajin;
    battleData[socket.roomId] [socket.userId] ['power'] = 1;
    battleData[socket.roomId] [socket.userId] ['enchantPower'] = 1;
    battleData[socket.roomId] [socket.userId] ['enchant1'] = 0;
    battleData[socket.roomId] [socket.userId] ['enchant2'] = 0;
    battleData[socket.roomId] [socket.userId] ['enchant3'] = 0;

    socket.userIds = Object.keys(battleData[socket.roomId]) ;
    socket.opponentId = '';
    for (let i of socket.userIds) {
      if (i !== socket.userId) {
        socket.opponentId = i;
      }
    }

    socket.sakemajin1 = battleData[socket.roomId] [socket.userId] ['sakemajin'];
    if (socket.opponentId) {
      socket.sakemajin2 = battleData[socket.roomId] [socket.opponentId] ['sakemajin'];
      if (socket.sakemajin1 === 'sakemajin1' && socket.sakemajin2 === 'sakemajin1') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1;
      } else if (socket.sakemajin1 === 'sakemajin1' && socket.sakemajin2 === 'sakemajin2') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1.3;
      } else if (socket.sakemajin1 === 'sakemajin1' && socket.sakemajin2 === 'sakemajin3') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1.3;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1;
      } else if (socket.sakemajin1 === 'sakemajin2' && socket.sakemajin2 === 'sakemajin1') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1.3;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1;
      } else if (socket.sakemajin1 === 'sakemajin2' && socket.sakemajin2 === 'sakemajin2') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1;
      } else if (socket.sakemajin1 === 'sakemajin2' && socket.sakemajin2 === 'sakemajin3') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1.3;
      } else if (socket.sakemajin1 === 'sakemajin3' && socket.sakemajin2 === 'sakemajin1') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1.3;
      } else if (socket.sakemajin1 === 'sakemajin3' && socket.sakemajin2 === 'sakemajin2') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1.3;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1;
      } else if (socket.sakemajin1 === 'sakemajin3' && socket.sakemajin2 === 'sakemajin3') {
        battleData[socket.roomId] [socket.userId] ['power'] = 1;
        battleData[socket.roomId] [socket.opponentId] ['power'] = 1;
      }

      battleData[socket.roomId] [socket.userId] ['enchantPower'] = battleData[socket.roomId] [socket.userId] ['power'];

      battleData[socket.roomId] [socket.opponentId] ['enchantPower'] = Math.round(
        battleData[socket.roomId] [socket.opponentId] ['power']
        * Math.pow(1.003, battleData[socket.roomId] [socket.opponentId] ['enchant1'])
        * Math.pow(1.03, battleData[socket.roomId] [socket.opponentId] ['enchant2'])
        * 1000
      ) / 1000;
    }
    io.of('/match').to(socket.roomId).emit('setSakemajin', battleData[socket.roomId]);
  });

  socket.on('setEnchant', (data) => {
    if (battleData[socket.roomId] [socket.userId] ['sakemajin']) {
      if (data.enchant === 'enchant1') {
        battleData[socket.roomId] [socket.userId] ['enchant1'] ++;
      } else if (data.enchant === 'enchant2') {
        battleData[socket.roomId] [socket.userId] ['enchant2'] ++;
      }
      battleData[socket.roomId] [socket.userId] ['enchantPower'] = Math.round(
        battleData[socket.roomId] [socket.userId] ['power']
        * Math.pow(1.003, battleData[socket.roomId] [socket.userId] ['enchant1'])
        * Math.pow(1.03, battleData[socket.roomId] [socket.userId] ['enchant2'])
        * 1000
      ) / 1000;
      io.of('/match').to(socket.roomId).emit('setEnchant', battleData[socket.roomId]);
    }
  });

  socket.on('gameStart', (data) => {
    socket.userIds = Object.keys(battleData[socket.roomId]) ;
    socket.opponentId = '';
    for (let i of socket.userIds) {
      if (i !== socket.userId) {
        socket.opponentId = i;
      }
    }
    battleData[socket.roomId] [socket.userId] ['count'] = 5 ;
    var countDown = () => {
      var id = setTimeout(countDown, 1000);
      if (Object.keys(battleData[socket.roomId]).length === 2) {
        io.of('/match').to(socket.id).emit('gameStart', battleData[socket.roomId]);
        if (battleData[socket.roomId] [socket.userId] ['count'] > 0) {
          battleData[socket.roomId] [socket.userId] ['count']--;
        } else {　
          if (battleData[socket.roomId] [socket.userId] ['enchantPower'] > battleData[socket.roomId] [socket.opponentId] ['enchantPower']) {
            io.of('/match').to(socket.id).emit('gameEnd', 'you win');
          } else if (battleData[socket.roomId] [socket.userId] ['enchantPower'] < battleData[socket.roomId] [socket.opponentId] ['enchantPower']) {
            io.of('/match').to(socket.id).emit('gameEnd', 'you lose');
          } else if (battleData[socket.roomId] [socket.userId] ['enchantPower'] === battleData[socket.roomId] [socket.opponentId] ['enchantPower']) {
            io.of('/match').to(socket.id).emit('gameEnd', 'draw');
          }
          clearTimeout(id);
        }
      } else {　
        clearTimeout(id);
      }
    };
    countDown();
  });

  socket.on('reset', (data) => {
    socket.userIds = Object.keys(battleData[socket.roomId]) ;
    socket.opponentId = '';
    for (let i of socket.userIds) {
      if (i !== socket.userId) {
        socket.opponentId = i;
      }
    }
    battleData[socket.roomId] [socket.userId] ['sakemajin'] = '';
    battleData[socket.roomId] [socket.userId] ['power'] = 0;
    battleData[socket.roomId] [socket.userId] ['enchantPower'] = 0;
    battleData[socket.roomId] [socket.userId] ['enchant1'] = 0;
    battleData[socket.roomId] [socket.userId] ['enchant2'] = 0;
    battleData[socket.roomId] [socket.userId] ['enchant3'] = 0;

    battleData[socket.roomId] [socket.opponentId] ['sakemajin'] = '';
    battleData[socket.roomId] [socket.opponentId] ['power'] = 0;
    battleData[socket.roomId] [socket.opponentId] ['enchantPower'] = 0;
    battleData[socket.roomId] [socket.opponentId] ['enchant1'] = 0;
    battleData[socket.roomId] [socket.opponentId] ['enchant2'] = 0;
    battleData[socket.roomId] [socket.opponentId] ['enchant3'] = 0;
  });


  socket.on('disconnect', () => {
    socket.opponentId = '';
    socket.userIds = Object.keys(battleData[socket.roomId]) ;
    for (let i of socket.userIds) {
      if (i !== socket.userId) {
        socket.opponentId = i;
      }
    }

    delete battleData[socket.roomId] [socket.userId];
    if (socket.opponentId) {
      delete battleData[socket.roomId] [socket.opponentId] ['sakemajin'];
      delete battleData[socket.roomId] [socket.opponentId] ['enchantPower'];
    }
    if (Object.keys(battleData[socket.roomId]).length === 0) {
      delete battleData[socket.roomId];
    }

    io.of('/match').to(socket.roomId).emit('match', battleData[socket.roomId]);
    io.of('/match').to(socket.roomId).emit('setSakemajin', battleData[socket.roomId]);
  });
});


module.exports = app;
