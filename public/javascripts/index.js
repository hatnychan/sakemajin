$(() => {
  'use strict';
  const match = io.connect('http://192.168.33.10:8000/match');
  match.json.emit('emit_from_client', {
    userName: $('#userName').val()
  });
});




// $(() => {
//   'use strict';
//   const chat = io.connect('http://192.168.33.10:8000/chat');
//   const news = io.connect('http://192.168.33.10:8000/news');
//   $('#myForm').submit((e) => {
//     e.preventDefault();
//     chat.json.emit('emit_from_client', {
//       room: $('#rooms').val(),
//       msg: $('#msg').val(),
//       name: $('#name').val()
//     });
//     $('#msg').val('').focus();
//   });
//   chat.on('emit_from_server', (data) => {
//     $('#logs').append($('<p>').text(data));
//   });
//   news.on('emit_from_server', (data) => {
//     $('#news').text(data);
//   });
// });
