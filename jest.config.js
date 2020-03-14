module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src/nib',
  testRegex: "(\\.|/)(test|spec)\\.[jt]sx?$",
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals:{
    'ts-jest': {
      isolatedModules: true,
	    tsConfig: "tsconfig.json"
    }
  },
  moduleNameMapper:{
    "\\.(css|styl)$": "<rootDir>/test/fileTransformer.js",
    "./assets/icon": "<rootDir>/test/fileTransformer.js"
  }
};