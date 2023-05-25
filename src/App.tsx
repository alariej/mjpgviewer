import React, { Component } from 'react';
import { StyleSheet, ImageBackground, Pressable, Text, SafeAreaView, LayoutChangeEvent } from 'react-native';

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
		fontSize: 16,
		color: 'white',
	},
});

const baseUri = 'http://192.168.1.49:8000/';
const stream = 'stream.mjpg';
const imageW = 1024;
const imageH = 576;

interface AppProps {}

interface AppState {
	isStreaming: boolean;
	imageMarginV: number;
	imageMarginH: number;
}

export default class App extends Component<AppProps, AppState> {
	constructor(props: AppProps) {
		super(props);
		this.state = { isStreaming: false, imageMarginV: 0, imageMarginH: 0 };
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

	public render(): JSX.Element | null {
		const media = this.state.isStreaming ? stream : 'image_' + Date.now();
		const mediaUri = baseUri + media;

		return (
			<SafeAreaView style={styles.container}>
				<ImageBackground
					style={styles.image}
					resizeMode="contain"
					source={{ uri: mediaUri }}
					onLayout={this.onLayout}
				>
					<Pressable
						style={[
							styles.button,
							{ marginBottom: this.state.imageMarginV + 8, marginLeft: this.state.imageMarginH + 8 },
						]}
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
						20.5 °C
					</Text>
				</ImageBackground>
			</SafeAreaView>
		);
	}
}
