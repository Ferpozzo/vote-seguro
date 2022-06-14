import * as React from 'react';
import { View, Dimensions, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Block, Button, Text, theme } from 'galio-framework';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletContext from '../providers/WalletProvider';
import ElectionContext, { loadBallots, loadContract, deployBallot, testBallots, loadBallotFromContract } from '../providers/ElectionContext';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import useColorScheme from '../hooks/useColorScheme';
import Images from '../constants/Images';
const { width, height } = Dimensions.get('screen');
import moment from 'moment'
export interface Screen {
    navigation: any
}
const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(
        address.length - 4,
        address.length
    )}`;
}
function checkVotation(votation: any, navigation: any, connector: any) {
    let buttonLayout;
    console.log(moment.unix(votation.ballot.endDate).toDate());

    if (new Date() <= moment.unix(votation.ballot.endDate).toDate()) {
        buttonLayout = (
            <Block center flex>
                <Block style={styles.buttons}>
                    <Button onPress={() => navigation.navigate('VotationDetail', { votation: votation, connector: connector })} style={styles.button} color='success'>Votar</Button>
                    <TouchableOpacity disabled={true}>
                        <Button onPress={() => navigation.navigate('VotationResults', { votation: votation, connector: connector })} style={styles.buttonDisabled} color='info'>Resultados</Button>
                    </TouchableOpacity>
                </Block>
                <Text color='#fff'>Aberta até: {moment.unix(votation.ballot.endDate).format('DD/MM/YYYY HH:mm:ss')}</Text>
            </Block>
        )
    } else {
        buttonLayout = (
            <Block center>
                <Block style={styles.buttons}>
                    <TouchableOpacity disabled={true}>
                        <Button onPress={() => navigation.navigate('VotationDetail', { votation: votation, connector: connector })} style={styles.buttonDisabled} color='success'>Votar</Button>
                    </TouchableOpacity>
                    <Button onPress={() => navigation.navigate('VotationResults', { votation: votation, connector: connector })} style={styles.button} color='info'>Resultados</Button>
                </Block>
                <Text color='#fff'>Aberta até: {moment.unix(votation.ballot.endDate).format('DD/MM/YYYY HH:mm:ss')}</Text>
            </Block>
        )
    }
    return buttonLayout
}
export default function Home() {
    const connector = useWalletConnect()
    const colorScheme = useColorScheme()
    const [votations, setVotations] = React.useState(
        <ImageBackground
            source={Images.RegisterBackground}
            style={{ width, height, zIndex: 1 }}
        >
            <Block flex center style={styles.home}>
                <ActivityIndicator size="large" />
            </Block>
        </ImageBackground>
    )
    const navigation = useNavigation();
    let votationsLayout: any[] = [];
    React.useEffect(() => {
        console.log(connector.accounts);
        loadBallots().then((v: any[]) => {
            v.map((e: any, index: number) => {
                votationsLayout.push(<Block style={styles.votation} shadow card center space={'evenly'} key={index}>
                    <Block center><Text color={'#fff'} h6>{e.ballot.name}</Text></Block>
                    <Block center width={200}><Text color='#fff' style={styles.votationsDescription} >{e.ballot.description}</Text></Block>
                    {checkVotation(e, navigation, connector)}
                </Block>)
            })
            setVotations(
                <ImageBackground
                    source={Images.RegisterBackground}
                    style={{ width, height, zIndex: 1 }}
                >
                    <Block flex center style={styles.home}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.votations}>
                            <Block style={styles.votations}>
                                {votationsLayout}
                            </Block>
                        </ScrollView>
                    </Block>
                </ImageBackground>
            )
        }).catch((err: any) => {
            console.log(err)
        })
    }, [])
    return (
        votations
    );
}
const styles = StyleSheet.create({
    home: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: height
    },
    votations: {
        width: width - (theme.SIZES?.BASE || 0) * 2,
        paddingVertical: theme.SIZES?.BASE,
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        justifyContent: 'space-evenly'
    },
    button: {
        width: 90,
        height: 35
    },
    buttonDisabled: {
        width: 90,
        height: 35,
        backgroundColor: 'grey'
    },
    votation: {
        height: 150,
        marginBottom: 10,
        width: '100%'
    },
    votationName: {
        fontSize: 16
    },
    votationsDates: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between'
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between'
    },
    votationDate: {
        fontSize: 13,
        width: 100
    },
    votationsDescription: {
        fontSize: 12,
        textAlign: 'center'
    }
});
