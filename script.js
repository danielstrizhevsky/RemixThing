SC.initialize({
  client_id: '83e1dee047f1c699b5152b42dd2ecb0f'
});

function searchAndPlay(songname, index) {
  SC.get('/tracks', { q: songname, limit: 50, tags: 'remix'}, function(tracks) {
    console.log(tracks.length);
    console.log(index);
    if (index < tracks.length) {
      $('#result').html(tracks[index].title);
      $('#linkbutton').attr('href', tracks[index].permalink_url);
      console.log(tracks[index].title);
    } else {
      $('#result').html("");
    }
    if (index + 1 < tracks.length) {
      $('#result2').html(tracks[index + 1].title);
      console.log(tracks[index + 1].title);
    } else {
      $('#result2').html("");
    }
    if (index + 2 < tracks.length) {
      $('#result3').html(tracks[index + 2].title);
      console.log(tracks[index + 2].title);
    } else {
      $('#result3').html("");
    }
    SC.stream("/tracks/" + tracks[index].id, function(sound) {
      sound.start();
      $('#songbutton').click(function() {
        sound.stop();
      });
      $('#pausebutton').click(function() {
        if (!sound.paused) {
          sound.pause();
          $('#pausebutton').html('RESUME');
          $('#pausebutton').css('padding', '4px 7px 4px 8px');
        } else if (sound.paused) {
          sound.play();
          $('#pausebutton').html('PAUSE');
          $('#pausebutton').css('padding', '4px 20px 4px 20px');
        }
      });
      $('#linkbutton').click(function() {
        if (!sound.paused) {
          $('#pausebutton').click();
        }
      });
    });
  });
}

var song_name_prev = '';
var song_name = '';
var song_index = 0;
var remix = false;
var buttonText = 'PLAY';

$(document).ready(function() {
  $('#songbutton').click(function() {
    console.log(remix);
    console.log(song_index);
    song_name_prev = song_name;
    song_name = $('#songname').val();
    if (song_name_prev == song_name) {
      if (remix) {
        song_index++;
      } else {
        remix = true;
      }
      var colorList = ['#7FDBFF', '#01FF70', '#FFDC00', '#FF4136', '#F012BE'];
      var randomColor = colorList[Math.floor(Math.random() * colorList.length)];
      $(document.body).css('background-color', randomColor);
      searchAndPlay(song_name, song_index);
    } else {
      remix = false;
      $(document.body).css('background-color', 'white');
      song_index = 0;
      youtubeSearch(song_name);
      buttonText = 'REMIX';
      $('#songbutton').html(buttonText);
      $('#songbutton').css('padding', '4px 11px 4px 11px');
    }
  });

  $("#songname").keyup(function(event){
    if(event.keyCode == 13){
      $("#songbutton").click();
    }
  });
  $('#songname').on('input', function() {
    if (buttonText == 'REMIX') {
      buttonText = 'PLAY';
      $('#songbutton').html(buttonText);
      $('#songbutton').css('padding', '4px 20px 4px 20px');
    }
    if ($('#songname').val() == song_name) {
      buttonText = 'REMIX';
      $('#songbutton').html(buttonText);
      $('#songbutton').css('padding', '4px 11px 4px 11px');
    }
  });

});

$("#songname").keyup(function(event){
  if(event.keyCode == 13){
    $("#songbutton").click();
  }
});

//youtube stuff
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var videoToPlay = '';
var playerInitialized = false;
var player;
var youtubeResponse;
var youtubePlaying = false;

function onClientLoad() {
  gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

function onYouTubeApiLoad() {
  gapi.client.setApiKey('AIzaSyCR5In4DZaTP6IEZQ0r1JceuvluJRzQNLE');
}

function youtubeSearch(song_name) {
  var request = gapi.client.youtube.search.list({
    part: 'snippet',
    q: song_name,
    type: 'video',
  });
  request.execute(onSearchResponse);
}

function onSearchResponse(response) {
  youtubeResponse = response;
  videoToPlay = response['items'][0]['id']['videoId'];
  $('#result').html(response['items'][0]['snippet']['title']);
  $('#linkpausebuttonarea').css('visibility', 'visible');
  $('#pausebutton').css('visibility', 'visible');
  $('#result2').html('');
  $('#result3').html('');
  console.log(videoToPlay);
  loadPlayer();
}

function loadPlayer() {
  youtubePlaying = true;
  if (!playerInitialized) {
    player = new YT.Player('player', {
      videoId: videoToPlay,
      events: {
        'onReady': function() {
          player.playVideo();
        }
      }
    });
    playerInitialized = true;
    $('#songbutton').click(function() {
      youtubePlaying = false;
      player.stopVideo();
      $('#pausebutton').html('PAUSE');
      $('#pausebutton').css('padding', '4px 20px 4px 20px');
    });
    $('#pausebutton').click(function() {
      if (youtubePlaying) {
        if (player.getPlayerState() == 1) {
          player.pauseVideo();
          $('#pausebutton').html('RESUME');
          $('#pausebutton').css('padding', '4px 7px 4px 8px');
        } else if (player.getPlayerState() == 2) {
          player.playVideo();
          $('#pausebutton').html('PAUSE');
          $('#pausebutton').css('padding', '4px 20px 4px 20px');
        }
      }
    });
    $('#linkbutton').click(function() {
      if (youtubePlaying) {
        $('#linkbutton').attr('href', 'https://www.youtube.com/watch?v='
        + youtubeResponse['items'][0]['id']['videoId'] + '#t='
        + player.getCurrentTime());
        if (player.getPlayerState() == 1) {
          $('#pausebutton').click();
        }
      }
    });
  } else {
    player.loadVideoById(videoToPlay);
  }
}
