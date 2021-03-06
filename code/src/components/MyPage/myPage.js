import React from "react"
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom"
import "./myPage.scss"
import ActivityGrid from "../ActivityGrid/activityGrid.js"
import Graph from "../Graph/graph.js"
class MyPage extends React.Component {

state = {
  myTeam: "",
  showModal: false,
  activities: [
    "Gick",
    "Sprang",
    "Cyklade"
  ],
  workouts: [],
  currentText: "",
  placeHolderText: "Lägg till aktivitet",
  modalActivity: "Gick",
  modalDay: 0,
  chosenIntensity: 2,
  weekPoints: [],
  activityLog: [],
  dailyTotal: [0, 0, 0, 0, 0, 0, 0]
}

getChosenTeam = () => {
  if (localStorage.getItem("chosenTeam")) {
    this.setState({
      myTeam: localStorage.getItem("chosenTeam")
    })
  }
}

getActivities = () => {
  if (localStorage.getItem("activities")) {
    const dataFromStorage = JSON.parse(localStorage.getItem("activities"))
    this.setState({
      activities: dataFromStorage
    })
  }
}

getWorkouts = () => {
  if (localStorage.getItem("workouts")) {
    const dataFromStorage = JSON.parse(localStorage.getItem("workouts"))
    this.setState({
      workouts: dataFromStorage
    }, () => {
      this.updateGrid()
    })
  }
}

getActivityLog = () => {
  if (localStorage.getItem("activityLogEntries")) {
    const dataFromStorage = JSON.parse(localStorage.getItem("activityLogEntries"))
    this.setState({
      activityLog: dataFromStorage
    }, () => {
    })
  }
}

getDailyTotal = () => {
  if (localStorage.getItem("dailyTotal")) {
    const dataFromStorage = JSON.parse(localStorage.getItem("dailyTotal"))
    this.setState({
      dailyTotal: dataFromStorage
    })
  }
}


handleGridClick = (activity, day) => {
  this.showModal(activity, day)
}

handleNewText = e => this.setState({
  currentText: e.target.value
})

handleSubmitNew = e => {
  e.preventDefault()
  const { currentText } = this.state
  if (!this.state.currentText.length) {
    this.setState({ placeHolderText: "Namnge din aktivitet" })
  } else {
    const newActivity = [
      this.state.currentText
    ]
    this.setState({
      activities: this.state.activities.concat(newActivity),
      currentText: "",
      placeHolderText: "Lägg till aktivitet"
    }, () => {
      const dataToStorage = JSON.stringify(this.state.activities)
      localStorage.setItem("activities", dataToStorage)
    })
  }
}

showModal = (activity, day) => {
  this.setState({
    showModal: true,
    modalActivity: activity,
    modalDay: day
  })
}

hideModal = () => {
  this.setState({ showModal: false })
}

handleWorkoutIntensity = e => {
  this.setState({
    chosenIntensity: e.target.value
  })
}

addWorkout = e => {
  e.preventDefault()
  this.hideModal()
  const newWorkout = {
    name: this.state.modalActivity,
    day: this.state.modalDay,
    intensity: Number(this.state.chosenIntensity)
  }
  const workoutActivity = this.state.modalActivity
  const newLogEntry = {
    day: newWorkout.day,
    activity: workoutActivity,
    intensity: newWorkout.intensity
  }
  const newDailyTotal = this.state.dailyTotal
  newDailyTotal[this.state.modalDay] += Number(this.state.chosenIntensity)
  this.setState({
    activityLog: [newLogEntry, ...this.state.activityLog],
    workouts: this.state.workouts.concat(newWorkout),
    dailyTotal: newDailyTotal
  }, () => {
    const workoutData = JSON.stringify(this.state.workouts)
    localStorage.setItem("workouts", workoutData)
    const activityLogData = JSON.stringify(this.state.activityLog)
    localStorage.setItem("activityLogEntries", activityLogData)
    const dailyTotalData = JSON.stringify(this.state.dailyTotal)
    localStorage.setItem("dailyTotal", dailyTotalData)
    this.updateGrid()
  })
}

updateGrid = () => {
  const numberOfActivities = this.state.activities.length
  const updateToGrid = []
  for (let i = 0; i < numberOfActivities; i++) {
    updateToGrid.push([0, 0, 0, 0, 0, 0, 0])
  }
  this.state.workouts.map(workout => {
      const activityIndex = this.state.activities.indexOf(workout.name)
      const activityWeek = updateToGrid[activityIndex]
      const newPoints = activityWeek[workout.day] += workout.intensity
      activityWeek[workout.day] = newPoints
      updateToGrid[activityIndex] = activityWeek
  })
  this.setState({
    weekPoints: updateToGrid
  }, () => console.table(this.state.weekPoints))
}

componentDidMount() {
  this.getChosenTeam()
  this.getActivities()
  this.getWorkouts()
  this.getActivityLog()
  this.getDailyTotal()
}

render() {

  let selectedDay = ""
  switch (this.state.modalDay) {
    case 0:
      selectedDay = "Måndag"
      break
    case 1:
      selectedDay = "Tisdag"
      break
    case 2:
      selectedDay = "Onsdag"
      break
    case 3:
      selectedDay = "Torsdag"
      break
    case 4:
      selectedDay = "Fredag"
      break
    case 5:
      selectedDay = "Lördag"
      break
    case 6:
      selectedDay = "Söndag"
      break
    default:
      selectedDay = "Ingen dag vald"
  }
  return (
    <div className="mp-wrapper">
      <div className="mp-header-section">
        <h1>Min sida</h1>
        <div className="mp-header-section-team">
          <p><strong>Mitt lag:</strong> {this.state.myTeam}</p>
          <Link to="/">
            <button className="mp-header-section-button">Byt förening</button>
          </Link>
        </div>
      </div>
      <div className="activity-wrapper">
        <div className="graph-section">
          <Graph dailyTotal={this.state.dailyTotal} />
        </div>
        <div className="activity-section-grid">
          <ActivityGrid
            activities={this.state.activities}
            weekPoints={this.state.weekPoints}
            dailyTotal={this.state.dailyTotal}
            handleGridClick={(activity, day) => this.handleGridClick(activity, day)} />
        </div>
        <div className="activity-section-form">
          <form onSubmit={this.handleSubmitNew}>
            <input
            className="activity-form"
              type="text"
              value={this.state.currentText}
              placeholder={this.state.placeHolderText}
              onChange={this.handleNewText} />
            <button className="add-activity" type="submit">Lägg till</button>
          </form>
        </div>
        <div className="activity-section-log">
          <h3>Aktivitetslogg:</h3>
          <ul>
            {this.state.activityLog.map(activity => {
              let logDay = ""
              switch (activity.day) {
                case 0:
                  logDay = "Måndag"
                  break
                case 1:
                  logDay = "Tisdag"
                  break
                case 2:
                  logDay = "Onsdag"
                  break
                case 3:
                  logDay = "Torsdag"
                  break
                case 4:
                  logDay = "Fredag"
                  break
                case 5:
                  logDay = "Lördag"
                  break
                case 6:
                  logDay = "Söndag"
                  break
                default:
                  logDay = "Ingen dag vald"
              }
              let logIntensity = ""
              switch (activity.intensity) {
                case 1:
                  logIntensity = "lätt intensitet"
                  break
                case 2:
                  logIntensity = "normal intensitet"
                  break
                case 3:
                  logIntensity = "hög intensitet"
                  break
                default:
                  logIntensity = "Ingen intensitet vald"
              }
              return(
                <li>
                <p><strong>{logDay}:</strong> {activity.activity} ({logIntensity})</p>
                </li>)
            })}
          </ul>
        </div>
      </div>
        <Modal show={this.state.showModal} handleClose={this.hideModal}>
          <div className="mp-modal-content">
            <h1>{selectedDay}</h1>
            <label htmlFor="intensity-select">
              <p>
                Nedan kan du välja hur intensivt ditt pass var när du <strong>{(this.state.modalActivity).toLowerCase()}</strong> den här dagen.
              </p>
            </label>
          <form onSubmit={this.addWorkout}>
            <div className="mp-modal-workout-form">
              <select id="intensity-select" onChange={this.handleWorkoutIntensity}>
                <option value="1">Lätt</option>
                <option value="2" selected>Normalt</option>
                <option value="3">Intensivt</option>
              </select>
            </div>
            <button className="choose" type="submit">Lägg till</button>
          </form>
          </div>
        </Modal>
    </div>
  )
}

}

const Modal = ({ handleClose, show, children }) => {

  return (
    <div className={show ? "mp-modal display-block" : "mp-modal display-none"}>
      <section className="mp-modal-main">
        {children}
        <button className="close" onClick={handleClose}>&times;</button>
      </section>
    </div>
  )
}

export default MyPage
