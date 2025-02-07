class PagesController < ApplicationController
  def home
    # You could use an instance variable to pass the message to the view
    @message = params[:message] || ""
  end

  def getTimes
     @message = "Hello, World"
    render :home
  end

  def next
    day = params[:day]
    src = params[:src]
    dst = params[:dst]

    timetable = JSON.parse(File.read(Rails.root.join("public", "data", "hiddingh.json")))
    current_time = "14:16"

    # options should be "Weekday" "Saturday" "Sunday"
    day_schedule = timetable[day]

    arrival_time, waiting_time = getNextBus(day_schedule, src, current_time)

    if arrival_time
      render json:
        {
          SRC: src,
          DST: dst,
          CURR_TIME: current_time,
          ARR_TIME: arrival_time,
          WAIT_TIME: waiting_time
        }
    else
      render json: { Message: "No more buses" }
    end
  end

  private

  def getNextBus(day_schedule, src, current_time)
    # selects
    sorted_buses = day_schedule
                    .select { |bus| bus[src] }
                    .sort_by { |bus| bus[src] }

    sorted_buses.each do |bus|
      bus_time = bus[src]
      if bus_time > current_time
        waiting_time = Time.parse(bus_time) - Time.parse(current_time)
        temp_waiting = Time.at(waiting_time).utc.strftime("%H:%M")
        return bus_time, temp_waiting
      end
    end

    nil
  end
end
