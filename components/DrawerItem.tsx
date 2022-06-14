import React from "react";
import { StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Block, Text, theme, Icon } from "galio-framework";
import * as SecureStore from 'expo-secure-store';

import argonTheme from "../constants/Theme";
export interface ScreenProps {
  title: string,
  focused: boolean,
  navigation: any
}
class DrawerItem extends React.Component<ScreenProps> {
  renderIcon = () => {
    const { title, focused } = this.props;

    switch (title) {
      case "Início":
        return (
          <Icon
            name="home"
            family="Feather"
            size={14}
            color={focused ? "white" : argonTheme.COLORS.PRIMARY}
          />
        );
      case "Configurações":
        return (
          <Icon
            name="settings"
            family="Feather"
            size={14}
            color={focused ? "white" : argonTheme.COLORS.PRIMARY}
          />
        );
      case "Começando no App":
        return (<Icon
          name="spaceship"
          family="MaterialIcons"
          size={14}
          color={"white"}
        />);
      case "Sair":
        return (<Icon
          name="logout"
          family="AntDesign"
          size={14}
          color={"white"}
        />);
      default:
        return null;
    }
  };

  render() {
    const { focused, title, navigation } = this.props;

    const containerStyles = [
      styles.defaultStyle,
      focused ? [styles.activeStyle, styles.shadow] : null
    ];

    return (
      <TouchableOpacity
        style={{ height: 60 }}
        onPress={() =>
          title == "Começando no App"
            ? Linking.openURL(
              "https://github.com/Ferpozzo/vote-seguro"
            ).catch(err => console.error("An error occurred", err))
            : title == "Sair" ? SecureStore.deleteItemAsync("token").then(d => {
              SecureStore.deleteItemAsync("email").then(e => {
                navigation.navigate("Onboarding")
              })
            }) : navigation.navigate(title)
        }
      >
        <Block flex row style={containerStyles}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            {this.renderIcon()}
          </Block>
          <Block row center flex={0.9}>
            <Text
              size={15}
              bold={focused ? true : false}
              color={focused || (title == "Começando no App" || title == "Sair") ? "white" : "rgba(0,0,0,0.5)"}
            >
              {title}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  activeStyle: {
    backgroundColor: argonTheme.COLORS.ACTIVE,
    borderRadius: 4
  },
  shadow: {
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.1
  }
});

export default DrawerItem;
