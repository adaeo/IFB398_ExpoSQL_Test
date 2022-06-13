import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";

import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

export default function App() {
  const db = SQLite.openDatabase("testing.db");

  useEffect(() => {
    async function initialise() {
      try {
        console.log("before init");
        let initValue = await initDB();
        console.log(initValue);
        console.log("after init");
        console.log("before set");
        let setValue = await setDB();
        console.log(setValue);
        console.log("after set");
      } catch (err) {
        console.log(err);
      }
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
    try {
      console.log("before get");
      let getValue = await getDB("test");
      console.log(getValue);
      console.log("after get");
    }
    catch (err) {
      console.log(err);
    }
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
