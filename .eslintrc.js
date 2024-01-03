module.exports = {
  root: true,
  extends: ["airbnb-base",'react-app', 
			'plugin:prettier/recommended'],
  plugins: [
    '@stylistic/js'
  ],
  rules: {
    // TODO: Add typescript types to decomposerize-website
    "react/prop-types": "off",
	"import/no-anonymous-default-export":"off",
	'@stylistic/js/indent': ['error', 4], 
  },
 "parser": "@babel/eslint-parser",
};
