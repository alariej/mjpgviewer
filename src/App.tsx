import { Component } from 'react';
import {
	StyleSheet,
	ImageBackground,
	Pressable,
	Text,
	SafeAreaView,
	LayoutChangeEvent,
	NativeSyntheticEvent,
	ImageErrorEventData,
	ImageLoadEventData,
	View,
} from 'react-native';

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
	},
	image: {
		flex: 1,
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		flexDirection: 'row',
		backgroundColor: 'lightsteelblue',
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 36,
		width: 36,
		borderRadius: 18,
	},
	playstop: {
		fontSize: 24,
		color: 'white',
	},
	temperature: {
		fontSize: 14,
		color: 'white',
	},
	placeholderView: {
		position: 'absolute',
		backgroundColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
	},
	placeholderText: {
		fontSize: 64,
	},
});

const stream = 'stream.mjpg';
const imageW = 1024;
const imageH = 576;

interface AppProps {}

interface AppState {
	isStreaming: boolean;
	imageMarginV: number;
	imageMarginH: number;
	temperature: number | undefined;
	isOffline: boolean;
}

export default class App extends Component<AppProps, AppState> {
	private webcamUrl: string | null;
	private latitude: string | null;
	private longitude: string | null;

	constructor(props: AppProps) {
		super(props);
		this.state = { isStreaming: false, imageMarginV: 0, imageMarginH: 0, temperature: undefined, isOffline: false };

		const queryParams = new URLSearchParams(window.location.search);
		this.latitude = queryParams.get('latitude');
		this.longitude = queryParams.get('longitude');
		this.webcamUrl = queryParams.get('webcamurl');
	}

	public componentDidMount(): void {
		const setTemperature = async () => {
			const response = await fetch(
				'https://api.open-meteo.com/v1/forecast?latitude=' +
					this.latitude +
					'&longitude=' +
					this.longitude +
					'&current_weather=true&forecast_days=1'
			);

			if (response.status === 200) {
				const weatherInfo = await response.json();
				const temperature = weatherInfo.current_weather.temperature;
				this.setState({ temperature: temperature });
			}
		};

		setTemperature();

		setInterval(setTemperature, 1000 * 60 * 15);
	}

	public componentWillUnmount(): void {

		// need to cancel interval
		
	}

	private toggleMedia = () => {
		this.setState({ isStreaming: !this.state.isStreaming });
	};

	private onLayout = (event: LayoutChangeEvent) => {
		const containerW = event.nativeEvent.layout.width;
		const containerH = event.nativeEvent.layout.height;
		const marginV = Math.max(0, (containerH - (containerW * imageH) / imageW) / 2);
		const marginH = Math.max(0, (containerW - (containerH * imageW) / imageH) / 2);

		if (this.state.imageMarginV !== marginV || this.state.imageMarginH !== marginH) {
			this.setState({ imageMarginV: marginV, imageMarginH: marginH });
		}
	};

	private onError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
		if (!this.state.isOffline) {
			this.setState({ isOffline: true });
		}
	};

	private onLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
		if (this.state.isOffline) {
			this.setState({ isOffline: false });
		}
	};

	public render(): JSX.Element | null {
		let placeholder;
		if (this.state.isOffline) {
			placeholder = (
				<View
					style={[
						styles.placeholderView,
						{
							top: this.state.imageMarginV,
							bottom: this.state.imageMarginV,
							left: this.state.imageMarginH,
							right: this.state.imageMarginH,
						},
					]}
				>
					<Text style={styles.placeholderText}>💤</Text>
				</View>
			);
		}

		const media = this.state.isStreaming ? stream : 'image_' + Date.now();
		const mediaUri = this.webcamUrl + media;

		return (
			<SafeAreaView style={styles.container}>
				<ImageBackground
					style={styles.image}
					resizeMode="contain"
					source={{ uri: mediaUri }}
					onLayout={this.onLayout}
					onError={this.onError}
					onLoad={this.onLoad}
				>
					{placeholder}
					<Pressable
						style={[
							styles.button,
							{
								marginBottom: this.state.imageMarginV + 8,
								marginLeft: this.state.imageMarginH + 8,
								opacity: this.state.isOffline ? 0.5 : 1,
							},
						]}
						disabled={this.state.isOffline}
						onPress={this.toggleMedia}
					>
						<Text style={styles.playstop}>{this.state.isStreaming ? '■' : '▶'}</Text>
					</Pressable>
					<Text
						style={[
							styles.temperature,
							{ marginBottom: this.state.imageMarginV + 8, marginRight: this.state.imageMarginH + 8 },
						]}
					>
						{this.state.temperature ? this.state.temperature + ' °C' : ''}
					</Text>
				</ImageBackground>
			</SafeAreaView>
		);
	}
}
