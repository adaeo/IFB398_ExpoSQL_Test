import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";

import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

export default function App() {
  const db = SQLite.openDatabase("testing.db");

  useEffect(() => {
    async function initialise() {
      console.log("before init");
      await initDB()
        .then((value) => console.log(value))
        .catch((err) => console.log(err));
      console.log("after init");
      console.log("before set");
      await setDB().then((value) =>
        console.log(value)).catch((err) => console.log(err));
      console.log("after set");
    }
    initialise();
  }, []);

  const initDB = () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        function (tx) {
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL);"
          );
        },
        function (error) {
          reject(error.message);
        },
        function () {
          resolve("Created Database OK");
          // console.log("Created database OK");
        }
      );
    });
  };

  const setDB = () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        function (tx) {
          tx.executeSql("INSERT INTO test (value) VALUES (?);", ["chicken"]);
        },
        function (error) {
          reject(error.message);
        },
        function () {
          resolve("Set Database OK");
          // console.log("Created database OK");
        }
      );
    });
  };

  async function getData(tableArg, nameArg) {
    console.log("before get");
    await getDB("test").then((data) => {console.log(data)}).catch((err) => {console.log(err)});
    console.log("after get")
  }

  const getDB = () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        function (tx) {
          tx.executeSql(
            "SELECT * FROM test;",
            [],
            function (tx, resultSet) {
              let data = [];
              for (let i = 0, c = resultSet.rows.length; i < c; i++) {
                data.push(resultSet.rows.item(i));
              }
              resolve(data);
            },
            function (tx, error) {
              reject(error.message);
            }
          );
        },
        function (error) {
          reject(error.message);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Press Me!"
        onPress={() => {
          getData();
        }}
      />
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
