import logo from './logo.svg';
import React, { useState, Component } from "react";
import './App.css';
import * as Main from './main.ts'
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import { CSVLink, CSVDownload } from 'react-csv';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import ProgressBar from 'react-bootstrap/ProgressBar'
import 'bootstrap/dist/css/bootstrap.min.css';

export var now = 0;

class App extends Component {
  constructor(props) {
    super(props);
    this.csvLink = React.createRef();
  }

  state = {
    getLP: false,
    getStaking: false,
    getWallet: false,
    id: 0,
    totalWin: 0,
    allocation: 0,
    minPoolz: 0,
    numOfWinners: 0,
    name: '',
    tiers: [],
    csvdata: '',
    newStakingAmount: 0,
    newStakingMin: 0,
    newStakingMax: 0,
    newStaking: 0
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
        <Button variant="contained" onClick={() => {
          Main.calcTotal(this.state.getLP, this.state.getStaking, this.state.getWallet).then(balances => {
            Main.RandomizeOneUps(balances, +this.state.newStakingAmount, +this.state.newStakingMin, +this.state.newStakingMax, +this.state.newStaking).then(balances => {
              Main.SortDictionary(balances).then(balances => {
                Main.RandomizeWinnings(balances, this.state.tiers, this.state.totalWin).then(result => {
                  Main.toCSV(result, this.state.tiers).then(csv => {
                    this.setState({ csvdata: csv });
                    this.csvLink.current.link.click();
                  });
                });
              });
            })
          })
        }
        }>
          Calculate Total
      </Button>
        <br />
        <TextField
          label="New Staking Amount"
          value={this.state.newStakingAmount}
          onChange={(event) => this.setState({ newStakingAmount: event.target.value })}
        />
        <TextField
          label="New Staking Min"
          value={this.state.newStakingMin}
          onChange={(event) => this.setState({ newStakingMin: event.target.value })}
        />
        <TextField
          label="New Staking Max"
          value={this.state.newStakingMax}
          onChange={(event) => this.setState({ newStakingMax: event.target.value })}
        />
        <TextField
          label="New Staking"
          value={this.state.newStaking}
          onChange={(event) => this.setState({ newStaking: event.target.value })}
        />
        <br />
        <TextField
          id="totalWin"
          label="Total Win"
          value={this.state.totalWin}
          onChange={(event) => this.setState({ totalWin: event.target.value })}
        />
        &nbsp;
        <TextField
          id="name"
          label="Name"
          value={this.state.name}
          onChange={(event) => this.setState({ name: event.target.value })}
        />
        &nbsp;
        <TextField
          id="allocation"
          label="Allocation"
          value={this.state.allocation}
          onChange={(event) => this.setState({ allocation: event.target.value })}
        />
        &nbsp;
        <TextField
          id="minPoolz"
          label="Minimum POOLZ"
          value={this.state.minPoolz}
          onChange={(event) => this.setState({ minPoolz: event.target.value })}
        />
        &nbsp;
        <TextField
          id="numOfWinners"
          label="Number Of Winners"
          value={this.state.numOfWinners}
          onChange={(event) => this.setState({ numOfWinners: event.target.value })}
        />
        <Button variant="contained" onClick={() => {
          let newTiers = [...this.state.tiers];
          newTiers.push({
            allocation: this.state.allocation,
            minPoolz: this.state.minPoolz,
            numOfWinners: this.state.numOfWinners,
            name: this.state.name,
            id: this.state.id
          });
          let newId = this.state.id + 1;
          this.setState({ tiers: newTiers, id: newId });
        }
        }>
          Add Tier
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Allocation %</TableCell>
              <TableCell>Minimum POOLZ</TableCell>
              <TableCell>Number Of Winners</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {this.state.tiers.map(value => (
              <TableRow><TableCell>{value.name}</TableCell>
                <TableCell>{value.allocation}</TableCell>
                <TableCell>{value.minPoolz}</TableCell>
                <TableCell>{value.numOfWinners}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => {
                    let index = this.state.tiers.findIndex(T => T.id == value.id);
                    this.state.tiers.splice(index, 1);//deletes element
                    this.setState({ tiers: this.state.tiers });// refreshes state
                  }
                  }>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
        <br />
        {/*<ProgressBar animated striped variant="success" now={progress} label={`${progress}%`} />)*/}
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
