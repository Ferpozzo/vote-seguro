import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../components/Themed';
import { Block, Button, Text, Input, Icon } from "galio-framework";
import { RootTabScreenProps } from '../../types';
import Images from "../../constants/Images";
import Theme from '../../constants/Theme';
import { MaskedTextInput } from "react-native-mask-text";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
const { width, height } = Dimensions.get("screen");
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';
import { useNavigation } from '@react-navigation/native';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import WalletContext from '../../providers/WalletProvider';
import { loadContract } from '../../providers/ElectionContext';

interface IFormInput {
    cpf: string;
    password: string;
}
const schema = yup.object({
    cpf: yup.string().min(11, "Insira um CPF válido").max(11, "Insira um CPF válido").required("CPF é obrigatório"),
    password: yup.string().required("Senha é obrigatória"),
}).required();


export default function Login() {
    const navigation = useNavigation()
    const connector = useWalletConnect();
    /*  const { wallet, setWallet } = React.useContext(WalletContext); */
    const [responseError, setResponseError] = useState('')
    const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<IFormInput>({
        resolver: yupResolver(schema)
    });
    useEffect(() => {
        register('cpf')
        register('password')
    }, [register])
    const onSubmit = (data: IFormInput) => {
        console.log(API_URL)
        axios.post(API_URL + '/auth', data)
            .then(response => {
                setResponseError('')
                if (connector.connected) {
                    connector.killSession().then(k => {
                        connector.connect().then(con => {
                            navigation.navigate("Início")
                        }).catch(err => {
                            setResponseError('Erro ao conectar a sua carteira, por favor reinicie o app e tente novamente')
                        })
                    })
                } else {
                    connector.connect().then(con => {
                        navigation.navigate("Início")
                    }).catch(err => {
                        setResponseError('Erro ao conectar a sua carteira, por favor reinicie o app e tente novamente')
                    })
                }
            })
            .catch(error => {
                if (error.response && error.response.data.error) {
                    setResponseError(error.response.data.error)
                } else {
                    setResponseError('Erro desconhecido, por favor reinicie o app e tente novamente')
                }
                console.log(responseError);
            });
    };
    return (
        <Block flex middle>
            <StatusBar hidden />
            <ImageBackground
                source={Images.RegisterBackground}
                style={{ width, height, zIndex: 1 }}
            >
                <Block safe flex middle>
                    <Block style={styles.registerContainer}>
                        <Block flex>
                            <Block flex={0.4} middle>
                                <Text color="#8898AA" size={12}>
                                    Preencha as informações para entrar
                                </Text>
                            </Block>
                            <Block flex center>
                                <KeyboardAvoidingView
                                    style={{ flex: 1 }}
                                    behavior="padding"
                                    enabled
                                >
                                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                                        <Text>CPF</Text>
                                        <Input
                                            borderless
                                            placeholder={"CPF"}
                                            onChangeText={text => setValue('cpf', text)}
                                            iconContent={
                                                <Icon
                                                    size={16}
                                                    color={Theme.COLORS.ICON}
                                                    family={'MaterialIcons'}
                                                    name="person"
                                                    style={styles.inputIcons}
                                                />
                                            }
                                        />
                                        {errors.cpf && <Block key='cpf'>{<Text color={Theme.COLORS.WARNING}>{errors.cpf?.message}</Text>}</Block>}

                                    </Block>
                                    <Block width={width * 0.8}>
                                        <Text>Senha</Text>
                                        <Input
                                            password
                                            borderless
                                            placeholder="Senha"
                                            onChangeText={text => setValue('password', text)}
                                            iconContent={
                                                <Icon
                                                    size={16}
                                                    color={Theme.COLORS.ICON}
                                                    family={'MaterialIcons'}
                                                    name="lock"
                                                    style={styles.inputIcons}
                                                />
                                            }
                                        />
                                    </Block>
                                    {errors.password && <Block key='password'>{<Text color={Theme.COLORS.WARNING}>{errors.password?.message}</Text>}</Block>}
                                    <Block middle>
                                        {responseError.length > 0 && <Block key='responseError'>{<Text color={Theme.COLORS.WARNING}>{responseError}</Text>}</Block>}
                                        <Button color="primary" style={styles.createButton} onPress={handleSubmit(onSubmit)}>
                                            <Text bold size={14} color={Theme.COLORS.WHITE}>
                                                ENTRAR
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

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    buttonStyle: {
        backgroundColor: "#3399FF",
        borderWidth: 0,
        color: "#FFFFFF",
        borderColor: "#3399FF",
        height: 40,
        alignItems: "center",
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 20,
        marginBottom: 20,
    },
    buttonTextStyle: {
        color: "#FFFFFF",
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        fontWeight: "600",
    },
    registerContainer: {
        width: width * 0.9,
        height: height * 0.875,
        backgroundColor: "#F4F5F7",
        borderRadius: 4,
        shadowColor: Theme.COLORS.BLACK,
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
        backgroundColor: Theme.COLORS.WHITE,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#8898AA"
    },
    socialButtons: {
        width: 120,
        height: 40,
        backgroundColor: "#fff",
        shadowColor: Theme.COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 0.1,
        elevation: 1
    },
    socialTextButtons: {
        color: Theme.COLORS.PRIMARY,
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
        width: width * 0.5,
        marginTop: 25
    }
});
