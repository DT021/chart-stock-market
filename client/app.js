"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";

import * as io from "socket.io-client"
import "style!./main.css";

import StockForm from "./components/StockForm";
import StockGraph from "./components/StockGraph";
import StockList from "./components/StockList";
import GraphButtons from "./components/GraphButtons";

var socket = io.connect("http://localhost:3000", { reconnection: false });

socket.on("connect", () => {
  console.log("Connected to socket server");
});

socket.on("connect_error", (error) => {
    console.log(error);
});

var StockApp = React.createClass({

  handleStockSubmit: function(stockData) {

    if (this.state.data.length <= 5) {
      socket.emit("request_stock", stockData);
    }
  },
  handleRemoveStock: function(stockIndex) {
    socket.emit("delete_stock", this.state.data[stockIndex]._id);

    this.setState({
      data: this.state.data.filter((stock, index) => index !== stockIndex)
    });
  },
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {

    socket.on("get_stocks", (stockList) => {
      this.setState({
        data: stockList
      });
    });

    socket.on("add_stock", (addedStock) => {

      if (addedStock.error) {

      } else {
        var newState = this.state.data.slice();
        newState.push(addedStock);

        this.setState({
          data: newState
        });
      }
    });
    socket.on("search_error", (errorMessage) => {
      console.log(errorMessage);
    });
  },
  render: function() {
    return (
      <div className="stockApp">
        <StockForm onStockSubmit={ this.handleStockSubmit }/>
        <StockList onRemoveStock={ this.handleRemoveStock } data={ this.state.data }/>
        <GraphButtons />
        <StockGraph data={ this.state.data }/>
      </div>
    );
  }
});

ReactDOM.render(
  <StockApp />,
  document.getElementById("app")
);
