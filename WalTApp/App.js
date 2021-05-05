import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Image, StatusBar } from 'react-native';
import RtcEngine from 'react-native-agora';
import SplashScreen from 'react-native-splash-screen';

  // Variables.
    var engine;                                // RtcEngine object.
    var dataStreamId;                          // Store data stream ID.
    var receivedMorse;                         // Store received morse code.
    var Sound = require('react-native-sound'); // Import for react-native-sound.
    var beep;                                  // Morse beep sound object.
    var isConnected = false;                   // To check if user is in channel

export default class App extends Component {
  // States for buttons (touchable highlights).
  state = {
    micPressed: false,
    dotMorsePressed: false,
    dashMorsePressed: false,
    channel1Pressed: false,
    channel2Pressed: false,
  };

  componentDidMount() {
      SplashScreen.hide();
      this.init()
  }

  init = async () => {
    // Initialize RtcEngine and event listeners.
      engine = await RtcEngine.create('74a529c906e84fe8bfe4a236869b736f');
      try {
          dataStreamId = await engine.createDataStream(true, true);
      } catch(error) {
          console.log(error.message);
      }
      Sound.setCategory('Playback');
      beep = new Sound('beep.wav', Sound.MAIN_BUNDLE, (error) => {
          if (error) {
              console.log('failed to load the sound', error);
              return;
          }
      })
      engine.addListener('StreamMessage', (uid, streamId, data) => {
          console.log('stream message was received: ', data, ' from: ', streamId )
          receivedMorse = data;
          console.log(receivedMorse);
          if(receivedMorse == 'dot'){
              beep.setCurrentTime(9.9);
              beep.play();
          } else {
              beep.setCurrentTime(9.7);
              beep.play();
          }
      })
      engine.addListener('StreamMessageError', (uid, streamId, err, missed, cached) => {
          console.log('ERROR: ', err)
      })
      engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
          console.log('channel was joined succesfully')
      })
      engine.addListener('LeaveChannel', (channel, uid, elapsed) => {
          console.log('channel was left succesfully')
      })
      engine.addListener('Warning', (warn) => {
          console.log('Warning', warn)
      })
      engine.addListener('Error', (err) => {
          console.log('Error', err)
      })
  }


  // Functions.
  micPressedFunc = () => {
    // Function to enable microphone and mute speaker when mic button is pressed.
    engine.adjustRecordingSignalVolume(100);
    engine.adjustAudioMixingVolume(0);
  };

  micReleasedFunc = () => {
    // Function to mute microphone and enable speaker when mic button is released.
    engine.adjustRecordingSignalVolume(0);
    engine.adjustAudioMixingVolume(100);
  };

  dotMorsePressedFunc = () => {
    // Function to send dot to other users in the channel.
    engine.sendStreamMessage(dataStreamId, 'dot');
    beep.setCurrentTime(9.9);
    beep.play();
  };

  dashMorsePressedFunc = () => {
    // Function to send dash to other users in the channel.
    engine.sendStreamMessage(dataStreamId, 'dash');
    beep.setCurrentTime(9.7);
    beep.play();
  };

  channel1PressedFunc = () => {
    // Function to leave previous channel and join channel 1.
    if(isConnected) {
        engine.leaveChannel();
        engine.joinChannel(null, 'walt-channel-1', null, 0);
    } else {
        engine.joinChannel(null, 'walt-channel-1', null, 0);
    }
    engine.adjustRecordingSignalVolume(0);
    engine.adjustAudioMixingVolume(100);
    isConnected = true;
    this.setState({
      channel1Pressed: true,
      channel2Pressed: false,
    });
  };

  channel2PressedFunc = () => {
    // Function to leave previous channel and join channel 2.
    if(isConnected) {
        engine.leaveChannel();
        engine.joinChannel(null, 'walt-channel-2', null, 0);
    } else {
        engine.joinChannel(null, 'walt-channel-2', null, 0);
    }
    engine.adjustRecordingSignalVolume(0);
    engine.adjustAudioMixingVolume(100);
    isConnected = true;
    this.setState({
      channel2Pressed: true,
      channel1Pressed: false,
    });
  };

  // Load component.
  render() {
    return (
        <View style={styles.container}>
          <View style={styles.channelMorseButtons}>
              <TouchableHighlight style={[(this.state.channel1Pressed) ? styles.channel1ButtonSelected : styles.channel1Button]} underlayColor="#B6D094"
                  onPress={() => this.channel1PressedFunc()}
                  onShowUnderlay={()=>this.setState({channel1Pressed:true})}>
                      <Text style={[(this.state.channel1Pressed) ? styles.textPressed : styles.textNormal]}> 1 </Text>
              </TouchableHighlight>

              <TouchableHighlight style={[(this.state.channel2Pressed) ? styles.channel2ButtonSelected : styles.channel2Button]} underlayColor="#B6D094"
                  onPress={() => {this.channel2PressedFunc()}}
                  onShowUnderlay={()=>this.setState({channel2Pressed:true})}>
                      <Text style={[(this.state.channel2Pressed) ? styles.textPressed : styles.textNormal]}> 2 </Text>
              </TouchableHighlight>
          </View>
          <StatusBar style="auto" />
          <TouchableHighlight style={styles.micButton} underlayColor="#B6D094"
              onShowUnderlay={()=>this.setState({micPressed:true})}
              onHideUnderlay={()=>this.setState({micPressed:false})}
              onPressIn={() => {this.micPressedFunc()}}
              onPressOut={() => {this.micReleasedFunc()}}>
              <Image source={(this.state.micPressed) ? require('./assets/black-mic.png') : require('./assets/green-mic.png')} style={[styles.imageButtonMic]}/>
          </TouchableHighlight>

          <View style={styles.channelMorseButtons}>
            <TouchableHighlight style={styles.dotMorseButton} underlayColor="#B6D094"
                onShowUnderlay={()=>this.setState({dotMorsePressed:true})}
                onHideUnderlay={()=>this.setState({dotMorsePressed:false})}
                onPress={() => this.dotMorsePressedFunc()}>
                <Image source={(this.state.dotMorsePressed) ? require('./assets/black-morse-dot.png') : require('./assets/green-morse-dot.png')} style={[styles.imageButton]}/>
            </TouchableHighlight>

             <TouchableHighlight style={styles.dashMorseButton} underlayColor="#B6D094"
                onShowUnderlay={()=>this.setState({dashMorsePressed:true})}
                onHideUnderlay={()=>this.setState({dashMorsePressed:false})}
                onPress={() => {this.dashMorsePressedFunc()}}>
                <Image source={(this.state.dashMorsePressed) ? require('./assets/black-morse-dash.png') : require('./assets/green-morse-dash.png')} style={[styles.imageButton]}/>
             </TouchableHighlight>
          </View>
        </View>
    );
  }
}

// Stylesheet.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313638',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelMorseButtons: {
    flex: 1,
    flexDirection: 'row',
  },
  micButton: {
    backgroundColor: '#313638',
    borderWidth: 2,
    borderColor: '#B6D094',
    borderRadius: 100,
    width: 200,
    height: 200,
    marginTop: '20%',
    marginBottom: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButton: {
    width: 20,
    height: 20,
  },
  imageButtonMic: {
    width: 100,
    height: 100,
  },
  channel1Button: {
    backgroundColor: '#313638',
    borderWidth: 2,
    borderColor: '#B6D094',
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    width: 125,
    height: 50,
    marginTop: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channel1ButtonSelected: {
    backgroundColor: '#B6D094',
    borderWidth: 2,
    borderColor: '#B6D094',
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    width: 125,
    height: 50,
    marginTop: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channel2Button: {
    backgroundColor: '#313638',
    borderWidth: 2,
    borderColor: '#B6D094',
    borderBottomRightRadius: 12,
    borderTopRightRadius: 12,
    width: 125,
    height: 50,
    marginTop: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channel2ButtonSelected: {
    backgroundColor: '#B6D094',
    borderWidth: 2,
    borderColor: '#B6D094',
    borderBottomRightRadius: 12,
    borderTopRightRadius: 12,
    width: 125,
    height: 50,
    marginTop: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotMorseButton: {
    backgroundColor: '#313638',
    borderWidth: 2,
    borderColor: '#B6D094',
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    width: 125,
    height: 50,
    marginTop: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashMorseButton: {
    backgroundColor: '#313638',
    borderWidth: 2,
    borderColor: '#B6D094',
    borderBottomRightRadius: 12,
    borderTopRightRadius: 12,
    width: 125,
    height: 50,
    marginTop: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNormal: {
    color: '#B6D094',
    fontSize: 28,
  },
  textPressed: {
    color: '#313638',
    fontSize: 28,
  },
});
