import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  SafeAreaView,
  Pressable,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import * as bcrypt from "react-native-bcrypt";

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

  const [login, onLoginChange] = useState({
    token: "",
    username: "",
    password: "",
  });
  const [searchText, changeSearchText] = useState("");
  const [writeText, changeWriteText] = useState("");
  const [ApiResponseText, setApiResponseText] = useState("");
  const [apiTextReturn, setReturnText] = useState("");
  const [text2, onChangeText2] = useState("");
  const [dbText, setDbText] = useState("");
  const [key, onChangeKey] = useState("Your key here");
  const [value, onChangeValue] = useState("Your value here");

  useEffect(() => {
    async function initialise() {
      try {
        let initValue = await initDB(); // Initialise table
        console.log(initValue);

        let setValue = await setDB("Hello from database"); // Add one item to table
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

  async function doLogin() {
    console.log(login.username + login.password);
    var username = login.username;
    var password = login.password;
    const response = await fetch(`http://neat.servebeer.com:3000/user/login`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: login.username,
        password: login.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      onLoginChange({
        token: data.message,
        username: username,
        password: password,
      });
      return;
    }

    console.log(data);
    onLoginChange({
      token: data.token,
      username: username,
      password: password,
    });
  }

  async function searchApiAndReturn() {
    console.log("console");
    const response = await fetch(`http://neat.servebeer.com:3000/rn/get`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: searchText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data.message);
      setReturnText(data.message);
      return;
    }

    console.log(data.text[0].text);

    setReturnText(data.text[0].text);
  }

  async function writeToApi() {
    console.log("writting to api");
    const response = await fetch(`http://neat.servebeer.com:3000/rn/write`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: writeText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data.message);
      setApiResponseText(data.message);
      return;
    }
    console.log(data.message);
    setApiResponseText(data.message);
  }

  async function getDataFromRESTAPI() {
    console.log("hello");
    const response = await fetch(`http://neat.servebeer.com:3000/rn/`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      return;
    }

    console.log(data);
    onChangeText2(data.message);
  }

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={{ padding: 25, fontSize: 25 }}>Connectivity</Text>
          <View style={{ padding: 12 }}>
            <View style={styles.container2}>
              <Text style={styles.paragraph}>
                Connect to database and get welcome message
              </Text>
              <Text style={styles.paragraph}>From Database: {dbText}</Text>
              <View style={{ padding: 6, width: "100%" }}>
                <Pressable style={styles.button} onPress={getData}>
                  <Text style={{ color: "white" }}>fetch from database</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View style={{ padding: 12 }}>
            <View style={styles.container2}>
              <Text style={styles.paragraph}>
                Connect to rest api and get welcome message
              </Text>
              <Text style={styles.paragraph}>From API: {text2}</Text>
              <View style={{ padding: 6, width: "100%" }}>
                <Pressable style={styles.button} onPress={getDataFromRESTAPI}>
                  <Text style={{ color: "white" }}>fetch from api</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.container}>
          <Text style={{ padding: 25, fontSize: 25 }}>Authentication</Text>
          <View style={{ padding: 12 }}>
            <View style={styles.container2}>
              <Text style={styles.paragraph}>
                Login to rest api and display a jwt token
              </Text>
              <Text style={styles.paragraph}>From API: {login.token}</Text>
              <View style={{ padding: 6, width: "100%" }}>
                <Pressable style={styles.button} onPress={doLogin}>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) =>
                      onLoginChange({
                        token: login.token,
                        username: text,
                        password: login.password,
                      })
                    }
                    placeholder={"username"}
                    value={login.username}
                  />
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) =>
                      onLoginChange({
                        token: login.token,
                        username: login.username,
                        password: text,
                      })
                    }
                    placeholder={"password"}
                    value={login.password}
                  />
                  <Text style={{ color: "white" }}>fetch from api</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.container}>
          <Text style={{ padding: 25, fontSize: 25 }}>Data retreival</Text>
          <View style={{ padding: 12 }}>
            <View style={styles.container2}>
              <Text style={styles.paragraph}>
                Type text and if its in api retrieve it.
              </Text>
              <Text style={styles.paragraph}>From API: {apiTextReturn}</Text>
              <View style={{ padding: 6, width: "100%" }}>
                <Pressable style={styles.button} onPress={searchApiAndReturn}>
                  <TextInput
                    style={styles.input}
                    onChangeText={changeSearchText}
                    placeholder={"query"}
                    value={searchText}
                  />
                  <Text style={{ color: "white" }}>search</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.container}>
          <Text style={{ padding: 25, fontSize: 25 }}>Data write</Text>
          <View style={{ padding: 12 }}>
            <View style={styles.container2}>
              <Text style={styles.paragraph}>
                type text and write it to the rest api
              </Text>
              <Text style={styles.paragraph}>
                Response from API: {ApiResponseText}
              </Text>
              <View style={{ padding: 6, width: "100%" }}>
                <Pressable style={styles.button} onPress={writeToApi}>
                  <TextInput
                    style={styles.input}
                    onChangeText={changeWriteText}
                    placeholder={"write"}
                    value={writeText}
                  />
                  <Text style={{ color: "white" }}>Write</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

{
  /* <TextInput
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
/> */
}

// <View style={styles.container}>
//         <Text style={styles.paragraph}>🔐 Enter 'red' for 'blue' 🔐</Text>
//         <TextInput
//           style={styles.textInput}
//           onSubmitEditing={(event) => {
//             getValueFor(event.nativeEvent.text);
//           }}
//           placeholder="SecureStore input"
//         />
//         <StatusBar style="auto" />
//       </View>
// Basic stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    backgroundColor: "white",
    marginHorizontal: 20,
  },
  container2: {
    flex: 2,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    backgroundColor: "red",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "white",
    width: "100%",
  },
  paragraph: {
    marginTop: 34,
    margin: 24,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  textInput: {
    height: 35,
    borderColor: "gray",
    borderWidth: 0.5,
    padding: 4,
  },
});
