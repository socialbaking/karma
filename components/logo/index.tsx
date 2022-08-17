import { Logo } from "./Logo";

function App() {
  return (
    <div className="App">
      <h2>test</h2>
      <Logo primary="pharma" secondary="karma" />
      <Logo primary="pharma" secondary="karma" size="2rem" />
      <Logo primary="canna" secondary="spy" size="2rem" />

      <Logo
        primary="pharma"
        secondary="karma"
        size="2rem"
        fontProps={{
          color: "#ff00ff"
        }}
      />
      <Logo iconOnly />
      <Logo iconOnly size="2rem" />
    </div>
  );
}

export default App;