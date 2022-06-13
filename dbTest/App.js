import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, TextInput } from "react-native";

import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

export default function App() {
  const db = SQLite.openDatabase("testing.db"); // Creates database if it doesn't exist

  const [text, onChangeText] = useState("");
  const [textValue, setTextValue] = useState("Initial Text");

  useEffect(() => {
    async function initialise() {
      try {
        console.log("before init");
        let initValue = await initDB();
        console.log(initValue);
        console.log("after init");
        console.log("before set");
        let setValue = await setDB("chicken");
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

  const setDB = (value) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        function (tx) {
          tx.executeSql("INSERT INTO test (value) VALUES (?);", [value]);
        },
        function (error) {
          reject(error.message);
        },
        function () {
          resolve("Set Database OK");
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
      setTextValue(getValue[0].value);
    } catch (err) {
      console.log(err);
    }
  }

  // Gets latest entry into database
  const getDB = () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        function (tx) {
          tx.executeSql(
            "SELECT * FROM test WHERE id=(SELECT max(id) FROM test);",
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
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        placeholder={"TextInput Area"}
        value={text}
      />
      <Button
        title="submit!"
        onPress={() => {
          setDB(text)
          getData();
        }}
      />
      <Text>{textValue}</Text>
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
