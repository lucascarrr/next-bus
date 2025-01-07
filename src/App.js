import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const routesData = {
    Hiddingh: {
      routeName: "Hiddingh",
      src: "Hiddingh",
      destination: "UC_South",
    },
    Sandown: { routeName: "Sandown", src: "Sandown", destination: "UC_North" },
    "City Bowl": {
      routeName: "City Bowl",
      src: "City Bowl",
      destination: "Gardens",
    },
    Gardens: { routeName: "Gardens", src: "Gardens", destination: "UCT" },
  };
  const [route, setRoute] = useState("Hiddingh"); // Default route
  const [src, setSrc] = useState(routesData[route].src); // Default source
  const [destination, setDestination] = useState(routesData[route].destination); // Default dest

  const [formattedTime, setFormattedTime] = useState("");
  const [nextBus, setNextBus] = useState("");

  const [showOptions, setShowOptions] = useState(false);
  const routeOptions = Object.keys(routesData);

  // Toggle the options list visibility
  const toggleOptions = () => setShowOptions(!showOptions);

  // Handle route selection
  const selectRoute = (selectedRoute) => {
    setRoute(selectedRoute);
    const selectedRouteData = routesData[selectedRoute];
    setShowOptions(false); // Close the options list after selection
    console.log("Selected Route is: " + selectedRoute);
    setSrc(selectedRouteData.src);
    setDestination(selectedRouteData.destination);
  };

  // Update time when the component mounts
  useEffect(() => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    setFormattedTime(`${hours}:${minutes}`);

    function getNextTimes(route, src, destination, current_time, day) {
      // Fetch the JSON file corresponding to the route
      fetch("/assets/" + route + ".json")
        .then((response) => response.json())
        .then((data) => {
          // Get the correct schedule based on the day
          const schedule =
            day === 6 || day == 7
              ? data.schedule.weekends
              : data.schedule.monday_to_friday;
          console.log(schedule);
          // Access the last time pair in "UC_South_to_Hiddingh_additional"
          const additionalTimes =
            data.schedule.monday_to_friday.UC_South_to_Hiddingh_additional;
          const lastTimePair = additionalTimes[additionalTimes.length - 1];

          console.log(lastTimePair);
          // console.log(schedule."UC_South_to_Hiddingh".)
          // Get the correct direction (source to destination or destination to source)
          let direction = `${src}_to_${destination}`;
          let busTimes = schedule[direction];

          if (!busTimes) {
            console.error("No bus times found for this route and direction.");
            return;
          }

          // Find the next bus time based on the current time
          const nextBus = findNextBus(busTimes, current_time);

          // Display the next bus time
          console.log("Next bus time: ", nextBus);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }

    function findNextBus(busTimes, current_time) {
      let currentHour = current_time.getHours();
      let currentMinute = current_time.getMinutes();
      let currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Loop through the bus times and find the first one that is after the current time
      for (let bus of busTimes) {
        let busTime = bus[src]; // Get the time for the source

        let [busHour, busMinute] = busTime.split(":").map(Number);
        let busTimeInMinutes = busHour * 60 + busMinute;

        if (busTimeInMinutes > currentTimeInMinutes) {
          return busTime;
        }
      }

      return "No more buses today";
    }

    getNextTimes(
      "Hiddingh",
      "Hiddingh",
      "uc_south",
      "10h00",
      currentTime.getDay()
    );
    setNextBus(``);
  }, []);

  return (
    <div className="App">
      <header>
        <h1>Next Bus:</h1>
        <span className="dropdown" onClick={toggleOptions}>
          {route}
        </span>
        {showOptions && (
          <div className="dropdown-options">
            {routeOptions.map((option, index) => (
              <div
                key={index}
                className="dropdown-item"
                onClick={() => selectRoute(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </header>

      <main>
        <div className="information">
          <h2 id="route-info">
            Going from <span className="bold-blue">{src}</span> to{" "}
            <span className="bold-blue">{destination}</span> at{" "}
            <span className="bold-blue">{formattedTime}</span> the bus comes at{" "}
            <span className="bold-red">{nextBus}</span>
          </h2>
          <h3>The next three busses are:</h3>
          <h4>
            You'll be waiting <span id="waiting-time">XX</span> minutes
          </h4>
        </div>
      </main>
    </div>
  );
}

export default App;
