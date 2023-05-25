import './App.css';

function App() {
	return (
		<div className="App">
			<img src="http://192.168.1.49:8000/stream.mjpg" width="1024" height="576" alt="stream" />
			<img src="http://192.168.1.49:8000/snapshot.jpg" width="1024" height="576" alt="snapshot" />
		</div>
	);
}

export default App;
