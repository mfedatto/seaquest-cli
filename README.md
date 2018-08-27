# Seaquest-CLI

Seaquest is a command-line tool for quick restful requests directly from the command-line.

## Getting started

To run Seaquest, make sure you have Node.js v6 or higher. [Install Node.js via package manager](https://nodejs.org/en/download/package-manager/).

### Installation

The easiest way to install Seaquest is using `npm`. If you have Node.js installed, it is most likely that you have `npm`
installed as well.

```console
$ npm install -g seaquest-cli
```

This installs Seaquest globally on your system allowing you to run it from anywhere. If you want to install it locally,
Just remove the `-g` flag.

## Usage

### Using Seaquest CLI

The `seaquest` command allows you to specify an endpoint to be called.

```console
$ seaquest https://api.ipify.org
```

If you have arguments to send in your request, just use the parameter `-a`, `--arguments`.

```console
$ seaquest http://www.omdbapi.com -a apikey=297b81a2 t=seaquest
```

### Command Arguments

For the complete list or arguments you may inform `-?`, `--help` argument.

| Argument                | Default | Type       | Multiple | Description | Example |
| ----------------------- |:------- |:---------- |:--------:|:----------- |:------- |
| `-e`, `--endpoint`      |         | `String`   | No       | The remote address for the calling endpoint. The argument name may be suppressed when its value is the first argument | `seaquest https://api.ipify.org` |
| `-a`, `--arguments`     |         | `String[]` | Yes      | The key and value strings for the arguments to be sent | `-a apikey=297b81a2 t=seaquest` |
| `-m`, `--method`        | `GET`   | `String`   | No       | The method to be used for calling the endpoint | `seaqeuest https://api.ipify.org -m GET` |
| `-h`, `--headers`       |         | `String[]` | Yes      | The key and value strings for the headers to be sent | `-h "X-User-Token: 1a2b3c4d" "X-Client-Agent: Seaquest-CLI"` |
| `-t`, `--timeout`       | `30000` | `Number`   | No       | The millisecond amount limit for receiving a response | `-t 10000` |
| `-l`, `--responseLimit` | `5120`  | `Number`   | No       | The maximum size of response body to output in the console | `-l 300` |
| `-u`, `--uncutResponse` | `false` | `Boolean`  | No       | Indicates if the response should not be limited | `-u` |
| `-j`, `--json`          | `false` | `Boolean`  | No       | Indicates if the response should be displayed as `JSON` | `-j` |
| `-v`, `--verbose`       | `false` | `Boolean`  | No       | Indicates if Seaquest should output all information about both request and response | `-v` |
| `-?`, `--help`          | `false` | `Boolean`  | No       | Indicates if help info should be shown instead of making any call to an endpoint | `-?` |

## Contributing

Please take a moment to analyse our [source code](https://github.com/mfedatto/seaquest-cli).
Open an [issue](https://github.com/mfedatto/seaquest-cli/issues) first to discuss potential changes/additions.
