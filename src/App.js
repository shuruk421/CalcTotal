import logo from './logo.svg';
import React, { useState, Component } from "react";
import './App.css';
import * as Main from './main.ts'
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import { CSVLink, CSVDownload } from 'react-csv';

class App extends Component {
  constructor(props) {
    super(props);
    this.csvLink = React.createRef();
  }
  state = {
    getLP: false,
    getStaking: false,
    getWallet: false,
    totalWin: 0,
    allocation: 0,
    minPoolz: 0,
    numOfWinners: 0,
    name: '',
    tiers: [],
    csvdata: ''
  };

  render() {
    return (
      <div className="App">
        Get LP:
        <Checkbox
          checked={this.state.getLP}
          onChange={(event) => this.setState({ getLP: event.target.checked })}
          name="getLPCheckBox"
          color="primary"
        />
          Get Staking:
        <Checkbox
          checked={this.state.getStaking}
          onChange={(event) => this.setState({ getStaking: event.target.checked })}
          name="getStakingCheckBox"
          color="primary"
        />
          Get Wallet:
        <Checkbox
          checked={this.state.getWallet}
          onChange={(event) => this.setState({ getWallet: event.target.checked })}
          name="getWalletCheckBox"
          color="primary"
        />
        <button onClick={() => {
          Main.calcTotal(this.state.getLP, this.state.getStaking, this.state.getWallet).then(balances => {
            Main.RandomizeWinnings(balances, this.state.tiers, this.state.totalWin).then(result => {
              Main.toCSV(result, this.state.tiers).then(csv => {
                this.setState({ csvdata: csv });
                this.csvLink.current.link.click();
              });
            });
          })
        }
        }>
          Calc Total
      </button>
        <br />
        <TextField
          id="totalWin"
          label="totalWin"
          value={this.state.totalWin}
          onChange={(event) => this.setState({ totalWin: event.target.value })}
        />
        &nbsp;
        <TextField
          id="name"
          label="name"
          value={this.state.name}
          onChange={(event) => this.setState({ name: event.target.value })}
        />
        &nbsp;
        <TextField
          id="allocation"
          label="allocation"
          value={this.state.allocation}
          onChange={(event) => this.setState({ allocation: event.target.value })}
        />
        &nbsp;
        <TextField
          id="minPoolz"
          label="minPoolz"
          value={this.state.minPoolz}
          onChange={(event) => this.setState({ minPoolz: event.target.value })}
        />
        &nbsp;
        <TextField
          id="numOfWinners"
          label="numOfWinners"
          value={this.state.numOfWinners}
          onChange={(event) => this.setState({ numOfWinners: event.target.value })}
        />
        <button onClick={() => {
          let newTiers = [...this.state.tiers];
          newTiers.push({ allocation: this.state.allocation, minPoolz: this.state.minPoolz, numOfWinners: this.state.numOfWinners, name: this.state.name });
          //{tiers: this.state.tiers.push({ allocation: this.state.allocation, minPoolz: this.state.minPoolz, numOfWinners: this.state.numOfWinners }) });
          this.setState({ tiers: newTiers });
        }
        }>
          Add Tier
        </button>
        <table>
          <tbody>
            <tr><th>name</th><th>allocation</th><th>minPoolz</th><th>numOfWinners</th></tr>
            {this.state.tiers.map(value => (<tr><td>{value.name}</td><td>{value.allocation}</td><td>{value.minPoolz}</td><td>{value.numOfWinners}</td></tr>))}
          </tbody>
        </table>
        <br />
        <CSVLink
          data={this.state.csvdata}
          filename={'output.csv'}
          className="hidden"
          ref={this.csvLink}
          target="_blank"
        />
      </div >
    );
  }
}

export default App;
