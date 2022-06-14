import * as React from 'react';
import { View, Dimensions, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, useColorScheme, TouchableOpacity } from 'react-native';
import { NavigationContainer, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Block, Button, Card, Text, theme } from 'galio-framework';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
const { width, height } = Dimensions.get('screen');
import moment from 'moment'
import Images from '../../constants/Images';
export interface Screen {
  navigation: any
}
type ParamList = {
  VotationDetail: {
    votation: Array<any>;
  };
};

export default class VotationDetail extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { votations: null }
  }
  renderVotations = () => {
    const { navigation } = this.props
    const votation = this.props.route.params.votation
    const connector = this.props.route.params.connector
    
    let candidates = votation.ballot.candidates.map((c, i) => {
      return (
        <Block style={{ width: '50%', height: 'auto' }} key={i}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Vote",
              {
                votation: votation,
                candidate: c,
                connector: connector
              })}
          >
            <Card
              titleColor='#fff'
              captionColor='#fff'
              flex
              borderless
              style={styles.card}
              title={c[1]}
              caption={c[2]}
              image={c[4]}
            />
          </TouchableOpacity>
        </Block>
      )
    })
    return (
      <ImageBackground
        source={Images.RegisterBackground}
        style={{  zIndex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.votations}>
          <Block style={styles.votations} flex>
            <Block style={styles.votationHeader} shadow card center space={'evenly'}>
              <Block center><Text color='#fff' h6>{votation.ballot.name}</Text></Block>
              <Block center><Text color='#fff' p size={13}>{votation.ballot.description}</Text></Block>
            </Block>
            <Block style={styles.votation} shadow card center space={'evenly'} >
              <Block style={styles.votationsDates}>
              </Block>
              <Block center><Text color='#fff' h7>Candidatos</Text></Block>
              <Block style={styles.votations}>
                {candidates}
              </Block>
            </Block>
          </Block>
        </ScrollView>
      </ImageBackground>
    )
  }

  render() {
    return (
      <Block flex center >
        {this.renderVotations()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  votations: {
    width: width - (theme.SIZES?.BASE || 0) * 2,
    paddingVertical: theme.SIZES?.BASE,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    width: 80,
    height: 35
  },
  votationHeader: {
    height: 120,
    marginBottom: 10,
    width: '100%'
  },
  votation: {
    height: 'auto',
    marginBottom: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly'
  },
  votationName: {
    fontSize: 16,
  },
  votationsDates: {
    paddingTop: 8,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '90%'
  },
  votationDate: {
    fontSize: 12,
    width: 100
  },
  candidateImage: {
    width: '100%',
    height: 185
  },
  candidateImageTextBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  candidate: {
    fontSize: 12,
    width: '100%',
    height: 'auto'
  },
  card: {
    width: '100%',
    height: 305,
    marginBottom: 10
  }
});