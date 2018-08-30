#!/usr/bin/env node

'use strict';

(function () {
  const chalk = require('chalk')
  const thisPackage = require('./package.json')
  const request = require('request')
  const commandLineArgs = require('command-line-args')
  const sleep = require('system-sleep')
  const optionDefinitions = [
    { name: 'endpoint', alias: 'e', type: String, defaultOption: true },
    { name: 'arguments', alias: 'a', type: String, multiple: true },
    { name: 'method', alias: 'm', type: String },
    { name: 'headers', alias: 'h', type: String, multiple: true },
    { name: 'timeout', alias: 't', type: Number },
    { name: 'body', alias: 'b', type: Number },
    { name: 'iterations', alias: 'i', type: Number },
    { name: 'iterationsIntervalTime', alias: 'r', type: Number },
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
  let overallIteration = 0

  try {
    let showHeader = function () {
      console.log()
      console.log(thisPackage.headline + ' v' + thisPackage.version.replace('-beta', chalk.yellow(' beta')) + ' by ' + thisPackage.author.name)
      console.log(thisPackage.description)
      console.log()
    }
    let ensureArguments = function () {
      let setDefaultValue = function (argument, defaultValue) {
        let argumentValue = options[argument]

        if (argumentValue === undefined || argumentValue === null) {
          options[argument] = defaultValue
        }
      }

      setDefaultValue('method', 'GET')
      setDefaultValue('arguments', [])
      setDefaultValue('headers', [])
      setDefaultValue('uncutResponse', false)
      setDefaultValue('responseLimit', 5120)
      setDefaultValue('json', false)
      setDefaultValue('timeout', 30000)
      setDefaultValue('verbose', false)
      setDefaultValue('help', false)
      setDefaultValue('iterations', 1)
      setDefaultValue('body', undefined)
      setDefaultValue('iterationsIntervalTime', 1000)
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

        if (options.body !== undefined) {
          req.multipart = [{ body: options.body }]
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
      for (let currentIteration = 0; currentIteration < options.iterations; currentIteration++) {
        executionStart = new Date()

        request(requestOptions, function (error, response, body) {
          executionEnd = new Date()

          showResponse(error, response, body)
        })

        sleep(options.iterationsIntervalTime)
      }
    }
    let showFooter = function () {
      console.log()
      console.log(chalk.bold.magenta('Thanks for choosing Seaquest ;)'))
    }
    let showResponse = function (error, response, body) {
      let currentIteration = overallIteration + 1

      overallIteration++

      if (error != null) {
        console.log(chalk.blue('TIMELAPSE') + ' ' + (executionEnd - executionStart) + 'ms')
        console.log(chalk.bgRed.white(error))
      } else {
        if (options.iterations === 1) {
          let responseBodyWrapper = function (body) {
            return chalk.bgCyan.black('[[') + body + chalk.bgCyan.black(']]')
          }
          let responseBody = chalk.bgWhite.black(body)
          let responseTruncated = false

          console.log(chalk.blue('TIMELAPSE') + ' ' + (executionEnd - executionStart) + 'ms')

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

          showFooter()
        } else {
          console.log('#' + currentIteration + ' ' + chalk.blue('HTTP') + ' ' + (response && response.statusCode) + ' ' + chalk.blue('TIMELAPSE') + ' ' + (executionEnd - executionStart) + 'ms')

          if (currentIteration === options.iterations) {
            showFooter()
          }
        }
      }
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
      console.log(chalk.blue('-b') + ', ' + chalk.blue('--body') + '          The body content to be sent on request.')
      console.log('                       Default is empty')
      console.log('                       Ex.: ' + chalk.bgWhite.black('-b { "id": "string", "length": 5 }'))
      console.log(chalk.blue('-i') + ', ' + chalk.blue('--iteration') + '          The number calls to be made. When higher than')
      console.log('                       1 the output is reduced.')
      console.log('                       Default is ' + chalk.yellow('1'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-i 5'))
      console.log(chalk.blue('-r') + ', ' + chalk.blue('--iterationsIntervalTime') + '          The millisecond interval between')
      console.log('                       iterations calls.')
      console.log('                       Default is ' + chalk.yellow('1000'))
      console.log('                       Ex.: ' + chalk.bgWhite.black('-r 5000'))
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
