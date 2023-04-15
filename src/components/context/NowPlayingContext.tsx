import { children, createContext, ParentComponent, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import {
  getSpotifyNowPlaying,
  setSpotifyPause,
  setSpotifyPlay
} from "../_utils/apiHelpers";


type NowPlayingContextType = {
  state: {
    nowPlaying: SpotifyApi.CurrentPlaybackResponse | undefined;
    nowPlayingProgressMs: number;
    manuallyDisableControls: boolean;
  },
  actions: {
    getNowPlaying: () => Promise<void>;
    setPause: () => Promise<void>;
    setPlay: () => Promise<void>;
    setNowPlayingProgressMs: (callbackMs: (current: number) => number) => void;
  }
};

const defaultState: NowPlayingContextType['state'] = {
  nowPlaying: undefined,
  nowPlayingProgressMs: 0,
  manuallyDisableControls: false
};

const NowPlayingStateContext = createContext<NowPlayingContextType['state']>(defaultState);

const NowPlayingActionsContext = createContext<NowPlayingContextType['actions']>({
  getNowPlaying: () => Promise.resolve(),
  setPause: () => Promise.resolve(),
  setPlay: () => Promise.resolve(),
  setNowPlayingProgressMs: (cb) => cb(0)
});

export const NowPlayingContextProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(defaultState);
  const { getToken } = useSpotifyAuth();

  const getNowPlaying = async () => {
    const accessToken = await getToken();
    if (!accessToken) return;

    const response = await getSpotifyNowPlaying(accessToken);
    setState({
      nowPlaying: response,
      nowPlayingProgressMs: response.progress_ms ?? 0,
      manuallyDisableControls: false
    })
  };

  const setPause = async () => {
    setState({ manuallyDisableControls: true })
    const accessToken = await getToken();
    if (!accessToken) return;
    
    const response = await setSpotifyPause(accessToken);
    setTimeout(() => getNowPlaying(), 100);
  };

  const setPlay = async () => {
    setState({ manuallyDisableControls: true })
    const accessToken = await getToken();
    if (!accessToken) return;
    
    const response = await setSpotifyPlay(accessToken);
    setTimeout(() => getNowPlaying(), 100);
  };

  const setNowPlayingProgressMs = (callbackMs: (current: number) => number) => {
    setState(current => ({ nowPlayingProgressMs: callbackMs(current.nowPlayingProgressMs) }))
  }

  return (
    <NowPlayingStateContext.Provider value={state}>
      <NowPlayingActionsContext.Provider value={{ getNowPlaying, setPause, setPlay, setNowPlayingProgressMs }}>
        {children(() => props.children)()}
      </NowPlayingActionsContext.Provider>
    </NowPlayingStateContext.Provider>
  );
};

export const useNowPlayingStateContext = () => useContext(NowPlayingStateContext);
export const useNowPlayingActionsContext = () => useContext(NowPlayingActionsContext);