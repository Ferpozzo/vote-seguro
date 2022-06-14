const Election = artifacts.require("Election");

module.exports = function (deployer) {
  let name = 'Primeira Eleição';
  let description = 'Primeira eleição descentralizada feita diretamente em uma rede blockchain';
  deployer.deploy(Election, name, description);
};
