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

  const switchPlaces = () => {
    const tempSrc = src;
    const tempDest = destination;
    setSrc(tempDest);
    setDestination(tempSrc);
    console.log(`Switching: source ${tempSrc} dest ${tempDest}`);
  };

  // Handle route selection
  const selectRoute = (selectedRoute) => {
    setRoute(selectedRoute);
    const selectedRouteData = routesData[selectedRoute];
    setShowOptions(false); // Close the options list after selection
    setSrc(selectedRouteData.src);
    setDestination(selectedRouteData.destination);
  };

  // Move getNextTimes outside of useEffect for accessibility
  function getNextTimes(route) {
    // Fetch the JSON file corresponding to the route
    fetch(process.env.PUBLIC_URL + "/assets/" + route + ".json")
      .then((response) => response.json())
      .then((data) => {
        // Get the correct schedule based on the day NA for now
        findNextBus(data.schedule.weekday, src, destination);
      });
  }

  function findNextBus(schedule, src_arg, dst_arg) {
    const currentTime = new Date();
    let currentHour = currentTime.getHours();
    let currentMinute = currentTime.getMinutes();
    let currentTimeInMinutes = currentHour * 60 + currentMinute; // Convert current time to minutes

    let closestTime = null;
    let closestRow = null;

    for (let row of schedule) {
      for (let stop in row) {
        if (stop === src_arg) {
          // Check if the stop matches the source argument
          let timeParts = row[stop].split(":"); // Split the time string (e.g., "6:30")
          let busHour = parseInt(timeParts[0], 10);
          let busMinute = parseInt(timeParts[1], 10);
          let busTimeInMinutes = busHour * 60 + busMinute;

          // Check if this time is greater than or equal to current time and closer
          if (busTimeInMinutes >= currentTimeInMinutes) {
            if (closestTime === null || busTimeInMinutes < closestTime) {
              closestTime = busTimeInMinutes;
              closestRow = row;
            }
          }
        }
      }
    }

    if (closestTime !== null) {
      setNextBus(closestRow[src_arg]);
      console.log(
        `Next bus from ${src_arg} to ${dst_arg} departs at ${closestRow[src_arg]}`
      );
      return closestRow;
    } else {
      console.log(`No more buses from ${src_arg} to ${dst_arg} today.`);
      return null;
    }
  }

  // Update time when the component mounts
  useEffect(() => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    setFormattedTime(`${hours}:${minutes}`);

    // Get the next bus on mount
    getNextTimes(route);
  }, [route]); // Re-run when the route changes

  // Trigger getNextTimes when src or destination change
  useEffect(() => {
    if (src && destination) {
      getNextTimes(route); // Fetch new bus times after src/destination change
    }
  }, [src, destination, route]);

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
          <div className="reverseButton" onClick={switchPlaces}>
            <h5>reverse</h5>
          </div>
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
