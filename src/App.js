import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function calculateWaitingTime(closestTime) {
    const closestMinutes = timeToMinutes(closestTime);
    const currentMinutes = timeToMinutes(formattedTime);
    let difference = closestMinutes - currentMinutes;

    console.log(closestMinutes + " || " + formattedTime + " || " + difference);
    if (difference < 0) {
      difference += 24 * 60; // Add 24 hours in minutes
    }

    return difference;
  }

  const routesData = {
    Hiddingh: {
      routeName: "Hiddingh",
      src: "Hiddingh",
      destination: "UC_South",
    },
    Sandown: { routeName: "Sandown", src: "Sandown", destination: "UC_North" },
  };

  const currentTime = new Date();
  const [route, setRoute] = useState("Hiddingh"); // Default route
  const [src, setSrc] = useState(routesData[route].src); // Default source
  const [destination, setDestination] = useState(routesData[route].destination); // Default destination

  const [formattedTime, setFormattedTime] = useState("");
  const [nextBus, setNextBus] = useState("");

  const [showOptions, setShowOptions] = useState(false);
  const routeOptions = Object.keys(routesData);

  const [waitingTime, setWaitingTime] = useState("");
  const [isFetching, setIsFetching] = useState(false); // Prevent duplicate fetches

  // Toggle the options list visibility
  const toggleOptions = () => setShowOptions(!showOptions);

  const switchPlaces = () => {
    const tempSrc = src;
    const tempDest = destination;
    setSrc(tempDest);
    setDestination(tempSrc);
    console.log(`Switching: source ${tempSrc} dest ${tempDest}`);

    // Recalculate bus times after switching
    setFormattedTime(getCurrentFormattedTime()); // Ensure time is updated
  };

  // Handle route selection
  const selectRoute = (selectedRoute) => {
    setRoute(selectedRoute);
    const selectedRouteData = routesData[selectedRoute];
    setShowOptions(false); // Close the options list after selection
    setSrc(selectedRouteData.src);
    setDestination(selectedRouteData.destination);
  };

  // Fetch bus times based on route, source, and destination
  function getNextTimes(route) {
    if (isFetching) return; // Prevent fetching if already in progress

    setIsFetching(true);
    // Fetch the JSON file corresponding to the route
    fetch(process.env.PUBLIC_URL + "/assets/" + route + ".json")
      .then((response) => response.json())
      .then((data) => {
        // Get the correct schedule based on the day NA for now
        findNextBus(data.schedule.weekday, src, destination);
        setIsFetching(false); // Reset fetching status
      });
  }

  function findNextBus(schedule, src_arg, dst_arg) {
    let currentHour = currentTime.getHours();
    let currentMinute = currentTime.getMinutes();
    let currentTimeInMinutes = currentHour * 60 + currentMinute;

    let closestTime = null;
    let closestRow = null;

    for (let row of schedule) {
      for (let stop in row) {
        if (stop === src_arg) {
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
      setWaitingTime(calculateWaitingTime(closestRow[src_arg]));
      console.log(
        `Next bus from ${src_arg} to ${dst_arg} departs at ${closestRow[src_arg]}`
      );
      return closestRow;
    } else {
      console.log(`No more buses from ${src_arg} to ${dst_arg} today.`);
      return null;
    }
  }

  function getCurrentFormattedTime() {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    const time = getCurrentFormattedTime();
    setFormattedTime(time);
  }, []);

  // Consolidated useEffect for route, src, destination changes
  useEffect(() => {
    if (src && destination && route) {
      getNextTimes(route); // Fetch new bus times when route, src, or destination changes
    }
  }, [route, src, destination]); // Trigger this effect only when these dependencies change

  return (
    <div className="App">
      <header>
        <h1>Next Bus:</h1>
        <div className="dropdown-container">
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
        </div>
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
          <h4>
            You'll be waiting <span id="waiting-time">{waitingTime}</span>{" "}
            minutes
          </h4>
        </div>
      </main>
    </div>
  );
}

export default App;
