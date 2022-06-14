import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

// Functions for SecureStore from https://docs.expo.dev/versions/latest/sdk/securestore/
async function save(key, value) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    alert("🔐 Here's your value 🔐 \n" + result);
  } else {
    alert("No values stored under that key.");
  }
}

export default function App() {
  const db = SQLite.openDatabase("testing.db"); // Creates database if it doesn't exist

  const [text, onChangeText] = useState("");
  const [dbText, setDbText] = useState("Initial Text");
  const [key, onChangeKey] = useState("Your key here");
  const [value, onChangeValue] = useState("Your value here");

  useEffect(() => {
    async function initialise() {
      try {
        let initValue = await initDB(); // Initialise table
        console.log(initValue);

        let setValue = await setDB("chicken (first value in useEffect)"); // Add one item to table
        console.log(setValue);

        save("red", "blue");
        console.log("Set SecureStore key value OK");
      } catch (err) {
        console.log(err);
      }
    }
    initialise(); // Call above function
  }, []);

  /*
  The db.transaction method executes an sql transaction.
  A transaction will have some parameters:
    @param callback: The SQL transaction to perform (tx.executeSql)
    @param fail callback: a function that executes on failed transaction
    @param success callback: a function that exectures on successful transaction

  The first callback is a function as an SQLTransaction object. 
  tx.executeSql will have some parameters:
    @param sqlStatement: A string of raw SQL
    @param args: A string or array of strings to replace ? wildcards.
    @param callback: a function that executes on successful execution (use this to handle response data)
    @param fail callback: a function that executes on failed execution
  */

  // Initialise the table in the database; simple example for now
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

  // sets a value into the above table. value is a parameter that must be a string
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

  // gets latest value from DB table and updates textValue.
  async function getData() {
    try {
      console.log("before get");
      let getValue = await getDB("test");
      console.log(getValue);
      console.log("after get");
      setDbText(getValue[0].value);
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
              // returns a resultSet on success
              let data = [];
              for (let i = 0, c = resultSet.rows.length; i < c; i++) {
                // loop through resultSet
                data.push(resultSet.rows.item(i)); // push each item on to end of stack/array
              }
              resolve(data); // return data array
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

  // Basic UI code, feel free to improve it.
  // TextInput used to store userInput
  // Button to submit input and update below Text
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
    >
      <View style={styles.container}>
        <Text>View 1</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.paragraph}>{dbText}</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          placeholder={"Database Input"}
          value={text}
        />
        <Button
          title="set and get!"
          onPress={() => {
            setDB(text);
            getData();
          }}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.paragraph}>🔐 Enter 'red' for 'blue' 🔐</Text>
        <TextInput
          style={styles.textInput}
          onSubmitEditing={(event) => {
            getValueFor(event.nativeEvent.text);
          }}
          placeholder="SecureStore input"
        />
        <StatusBar style="auto" />
      </View>
      <View style={styles.container}>
        <Text>View 4</Text>
      </View>
      <View style={styles.container}>
        <Text>View 5</Text>
      </View>
    </ScrollView>
  );
}

// Basic stylesheet
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
  paragraph: {
    marginTop: 34,
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    height: 35,
    borderColor: "gray",
    borderWidth: 0.5,
    padding: 4,
  },
});
