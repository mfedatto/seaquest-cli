#!/usr/bin/env node

'use strict';

(function () {
  const chalk = require('chalk')
  const thisPackage = require('./package.json')
  const request = require('request')
  const commandLineArgs = require('command-line-args')
  const optionDefinitions = [
    { name: 'endpoint', alias: 'e', type: String, defaultOption: true },
    { name: 'arguments', alias: 'a', type: String, multiple: true },
    { name: 'method', alias: 'm', type: String },
    { name: 'headers', alias: 'h', type: String, multiple: true },
    { name: 'timeout', alias: 't', type: Number },
    { name: 'uncutResponse', alias: 'u', type: Boolean },
    { name: 'responseLimit', alias: 'l', type: Number },
    { name: 'responseJson', alias: 'j', type: Boolean },
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'help', alias: '?', type: Boolean }
  ]
  const options = commandLineArgs(optionDefinitions)
  let requestOptions = null
  let executionStart = null
  let executionEnd = null

  try {
    let showHeader = function () {
      console.log(thisPackage.name + ' v' + thisPackage.version.replace('-beta', chalk.yellow(' beta')) + ' by ' + thisPackage.author)
      console.log(thisPackage.description)
      console.log()
    }
    let ensureArguments = function () {
      if (options.method === undefined) options.method = 'GET'
      if (options.arguments === undefined) options.arguments = []
      if (options.headers === undefined) options.headers = []
      if (options.uncutResponse === undefined) options.uncutResponse = false
      if (options.responseLimit === undefined) options.responseLimit = 5120
      if (options.json === undefined) options.json = false
      if (options.timeout === undefined) options.timeout = 30000
      if (options.verbose === undefined) options.verbose = false
      if (options.help === undefined) options.help = false
    }
    let buildRequestOptions = function () {
      if (buildRequestOptions.requestOptions === undefined) {
        let req = {}

        req.method = options.method
        req.uri = options.endpoint
        req.timeout = options.timeout
        req.body = options.body
        req.headers = options.headers

        for (let iArg = 0; iArg < options.arguments.length; iArg++) {
          req.uri += ((iArg === 0) ? '?' : '&') + options.arguments[iArg]
        }

        buildRequestOptions.requestOptions = req
      }

      requestOptions = buildRequestOptions.requestOptions
    }
    let showRequest = function () {
      console.log(chalk.blue(requestOptions.method) + ' ' + chalk.underline(requestOptions.uri))

      if (options.verbose) {
        for (let iHeader = 0; iHeader < requestOptions.headers.length; iHeader++) {
          console.log(chalk.cyan('HEADER'), requestOptions.headers[iHeader])
        }
      }
    }
    let execute = function () {
      executionStart = new Date()
      
      request(requestOptions, function (error, response, body) {
        executionEnd = new Date()
        
        showResponse(error, response, body)
      })
    }
    let showFooter = function () {
      console.log()
      console.log(chalk.bold.magenta('Thanks for choosing Seaquest ;)'))
    }
    let showResponse = function (error, response, body) {
      console.log(chalk.blue('TIMELAPSE') + ' ' + (executionEnd - executionStart) + 'ms')

      if (error != null) {
        console.log(chalk.bgRed.white(error))
      } else {
        let responseBodyWrapper = function (body) {
          return chalk.bgCyan.black('[[') + body + chalk.bgCyan.black(']]')
        }
        let responseBody = chalk.bgWhite.black(body)
        let responseTruncated = false

        if (!options.uncutResponse) {
          responseBody = chalk.bgWhite.black(body.substring(0, options.responseLimit))

          if (body.length > options.responseLimit) {
            options.responseJson = false
            responseTruncated = true
            responseBody += chalk.bgCyan.black('...')
          }
        }

        console.log(chalk.blue('HTTP') + ' ' + (response && response.statusCode))

        if (options.verbose) {
          for (let header in response.headers) {
            console.log(chalk.cyan('HEADER'), header + ': ' + response.headers[header])
          }
        }

        if (body.length > 0) {
          if (!options.responseJson) {
            console.log(responseBodyWrapper(responseBody))
          } else {
            console.dir(JSON.parse(body), { colors: true })
          }
        } else {
          console.log(chalk.italic.yellowBright('no-content'))
        }

        if (responseTruncated) {
          console.log(chalk.bgYellow.black('Response truncated at ' + options.responseLimit))
        }
      }

      showFooter()
    }
    let showHelp = function () {
      console.log(chalk.blue('-e') + ', ' + chalk.blue('--endpoint') + '         The remote address for the calling endpoint.')
      console.log('                       The argument name may be suppressed when its')
      console.log('                       value is the first argument')
      console.log('                       Ex.: ' + chalk.bgWhite.black('seaquest https://api.ipify.org'))
      console.log(chalk.blue('-a') + ', ' + chalk.blue('--arguments') + '        The key and value strings for the arguments')
      console.log('                       to be sent')
      console.log('                       Ex.: ' + chalk.bgWhite.black('-a apikey=297b81a2 t=seaquest'))
      console.log(chalk.blue('-m') + ', ' + chalk.blue('--method') + '           The method to be used for calling the endpoint')
      console.log('                       Default is ' + chalk.yellow('GET'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('seaqeuest https://api.ipify.org -m GET'))
      console.log(chalk.blue('-h') + ', ' + chalk.blue('--headers') + '          The key and value strings for the headers')
      console.log('                       to be sent')
      console.log('                       Ex.: ' + chalk.bgWhite.black('-h "X-User: 1a2b3c4d" "X-Client: Seaquest-CLI"'))
      console.log(chalk.blue('-t') + ', ' + chalk.blue('--timeout') + '          The millisecond amount limit for receiving a')
      console.log('                       response')
      console.log('                       Default is ' + chalk.yellow('3000'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-t 10000'))
      console.log(chalk.blue('-l') + ', ' + chalk.blue('--responseLimit') + '    The maximum size of response body to output')
      console.log('                       in the console')
      console.log('                       Default is ' + chalk.yellow('5120'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-l 300'))
      console.log(chalk.blue('-u') + ', ' + chalk.blue('--uncutResponse') + '    Indicates if the response should not be')
      console.log('                       limited')
      console.log('                       Default is ' + chalk.yellow('false'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-u'))
      console.log(chalk.blue('-j') + ', ' + chalk.blue('--json') + '             Indicates if the response should be displayed')
      console.log('                       as JSON')
      console.log('                       Default is ' + chalk.yellow('false'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-j'))
      console.log(chalk.blue('-v') + ', ' + chalk.blue('--verbose') + '          Indicates if Seaquest should output all')
      console.log('                       information about both request and response')
      console.log('                       Default is ' + chalk.yellow('false'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-v'))
      console.log(chalk.blue('-?') + ', ' + chalk.blue('--help') + '             Indicates if help info should be shown ')
      console.log('                       instead of making any call to an endpoint')
      console.log('                       Default is ' + chalk.yellow('false'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-?'))
      console.log()

      showFooter()
    }

    showHeader()

    if (options.help) {
      showHelp()
    } else {
      ensureArguments()
      buildRequestOptions()
      showRequest()
      execute()
    }
  } catch (ex) {
    console.log(chalk.bgRed.white.underline(ex.message))
  }
})()
