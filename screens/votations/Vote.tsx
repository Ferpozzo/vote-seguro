import * as React from 'react';
import { View, Dimensions, StyleSheet, ImageBackground, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Block, Button, Card, Icon, Input, Text, theme } from 'galio-framework';
const { width, height } = Dimensions.get('screen');
import Images from '../../constants/Images';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';
import { useForm } from 'react-hook-form';
import { useWalletConnect, WalletConnectProviderProps, withWalletConnect } from '@walletconnect/react-native-dapp';
import { createVote, userAlreadyVoted } from '../../providers/ElectionContext';

interface IFormInput {
    cpf: string;
    password: string;
}
const schema = yup.object({
    cpf: yup.string().min(11, "Insira um CPF válido").max(11, "Insira um CPF válido").required("CPF é obrigatório"),
    password: yup.string().required("Senha é obrigatória"),
}).required();

class Vote extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            cpf: '',
            password: '',
            error: null,
            voted: false
        }
    }
    componentDidMount() {
        const { votation, candidate, connector } = this.props.route.params
        userAlreadyVoted(connector.accounts[0], votation.address).then(voted => {
            this.setState({ voted: voted })
        })
    }
    _onSubmit(_candidate, _votation, connector) {
        const { navigation } = this.props
        axios.post(API_URL + '/auth', this.state)
            .then(response => {
                const vote = {
                    votation: _votation.address,
                    candidate: _candidate.id
                }
                createVote(connector.accounts[0], vote.votation, vote.candidate).then(voteParams => {
                    connector.sendTransaction(voteParams)
                }).catch(error => {
                    console.log(error);
                    this.setState({ error: error.message })
                })
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.data.error) {
                        this.setState({ error: error.response.data.error })
                    }
                } else if (error.request) {
                    console.log('Erro 2 ', error.request);
                } else {
                    console.log('Erro 3', error)
                }
            });
    }
    render() {
        const { navigation } = this.props;

        const { votation, candidate, connector } = this.props.route.params
        return (
            <Block flex middle>
                <StatusBar hidden />
                <ImageBackground
                    source={Images.RegisterBackground}
                    style={{ width, height, zIndex: 1 }}
                >
                    <Block flex middle>
                        <Block style={styles.registerContainer}>
                            <Block flex>
                                <Block flex middle>
                                    <Block style={styles.headerText}>{this.state.voted && (<Text color={theme.COLORS.WARNING}>Você já votou nesta votação, se deseja mudar seu voto, apenas vote novamente</Text>)}</Block>
                                    <Text style={styles.headerText} h6>
                                        Confirmar voto em <Text bold>{candidate.name}</Text> para <Text bold>{votation.ballot.name}</Text>?
                                    </Text>
                                    <KeyboardAvoidingView
                                        style={{ flex: 1 }}
                                        behavior="position"
                                        enabled
                                    >
                                        <Card
                                            flex
                                            borderless
                                            style={styles.card}
                                            title={candidate.name}
                                            caption={candidate.party}
                                            imageStyle={styles.cardImage}
                                            image={candidate.img}
                                        />
                                        <Block width={width * 0.8}>
                                            <Text>CPF</Text>
                                            <Input
                                                borderless
                                                placeholder="Seu CPF"
                                                onChangeText={(text) => this.setState({
                                                    cpf: text
                                                })}
                                                iconContent={
                                                    <Icon
                                                        size={16}
                                                        color={theme.COLORS.ICON}
                                                        name="person"
                                                        family="MaterialIcons"
                                                        style={styles.inputIcons}
                                                    />
                                                }
                                            />
                                            <Text>Senha</Text>
                                            <Input
                                                password
                                                borderless
                                                placeholder="Sua senha"
                                                onChangeText={(text) => this.setState({
                                                    password: text
                                                })}
                                                iconContent={
                                                    <Icon
                                                        size={16}
                                                        color={theme.COLORS.ICON}
                                                        name="lock"
                                                        family="MaterialIcons"
                                                        style={styles.inputIcons}
                                                    />
                                                }
                                            />
                                        </Block>
                                        <Block key='error'>{this.state.error && (<Text key={this.state.error} color={theme.COLORS?.ERROR}>{this.state.error}</Text>)}</Block>
                                        <Block style={styles.buttons}>
                                            <Button color="success" style={styles.createButton} onPress={() => this._onSubmit(candidate, votation, connector)}>
                                                <Text bold size={14} color={theme.COLORS.WHITE}>
                                                    CONFIRMAR
                                                </Text>
                                            </Button>
                                            <Button color="warning" style={styles.createButton} onPress={() => navigation.navigate("VotationDetail", {
                                                voted: {
                                                    candidate: candidate,
                                                    votation: votation
                                                }
                                            })}>
                                                <Text bold size={14} color={theme.COLORS.WHITE}>
                                                    CANCELAR
                                                </Text>
                                            </Button>

                                        </Block>
                                    </KeyboardAvoidingView>
                                </Block>
                            </Block>
                        </Block>
                    </Block>
                </ImageBackground>
            </Block>
        );
    }
}

const styles = StyleSheet.create({
    registerContainer: {
        width: width * 0.9,
        height: height * 0.875,
        backgroundColor: "#F4F5F7",
        borderRadius: 4,
        shadowColor: theme.COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 0.1,
        elevation: 1,
        overflow: "hidden"
    },
    socialConnect: {
        backgroundColor: theme.COLORS.WHITE,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#8898AA"
    },
    socialButtons: {
        width: 120,
        height: 40,
        backgroundColor: "#fff",
        shadowColor: theme.COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 0.1,
        elevation: 1
    },
    socialTextButtons: {
        color: theme.COLORS.PRIMARY,
        fontWeight: "800",
        fontSize: 14
    },
    inputIcons: {
        marginRight: 12
    },
    passwordCheck: {
        paddingLeft: 15,
        paddingTop: 13,
        paddingBottom: 30
    },
    createButton: {
        width: width * 0.3,
        marginTop: 25
    },
    card: {
        marginTop: 30,
        width: '100%',
        height: 'auto',
        minHeight: 220
    },
    cardImage: {
        borderRadius: 14,
        height: 350
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-evenly'
    },
    headerText: {
        color: "#8898AA",
        paddingTop: 20,
        textAlign: "center"
    }
});
export default (Vote)