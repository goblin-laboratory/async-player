import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import { Icon, Slider, Dropdown, Menu } from 'antd';
import TimeSlider from '../TimeSlider';
import 'antd/lib/tooltip/style/index.css';
import 'antd/lib/slider/style/index.css';
import 'antd/lib/dropdown/style/index.css';
import styles from './index.module.less';

import { ReactComponent as MutedSvg } from './muted.svg';
import { ReactComponent as UnmutedSvg } from './unmuted.svg';

const ReactPlayerSkin = React.memo(
  ({
    src,
    poster,
    loading,
    paused,
    ended,
    seeking,
    waiting,
    onPlayClick,
    onPauseClick,
    duration,
    buffered,
    currentTime,
    changeCurrentTime,
    muted,
    volume,
    changeVolume,
    onMutedClick,
    playbackRate,
    changePlaybackRate,
    pictureInPictureEnabled,
    pip,
    requestPictureInPicture,
    exitPictureInPicture,
    x5playsinline,
    fullscreen,
    x5videofullscreen,
    requestFullscreen,
    exitFullscreen,
    kernelMsg,
  }) => {
    const [hiding, setHiding] = React.useState(false);
    const [hovering, setHovering] = React.useState(false);
    const [sliding, setSliding] = React.useState(false);
    const [visible, setVisible] = React.useState(false);

    const autoHideRef = React.useRef(null);

    const autoHide = React.useCallback(timestamp => {
      if (!autoHideRef || !autoHideRef.current) {
        return;
      }
      if (undefined === autoHideRef.current.timestamp) {
        autoHideRef.current.timestamp = timestamp;
        global.requestAnimationFrame(autoHide);
        return;
      }
      if (3000 > timestamp - autoHideRef.current.timestamp) {
        global.requestAnimationFrame(autoHide);
        return;
      }
      autoHideRef.current = null;
      setHiding(true);
    }, []);

    const show = React.useCallback(
      timestamp => {
        if (!autoHideRef) {
          return;
        }
        if (!autoHideRef.current) {
          setHiding(false);
          global.requestAnimationFrame(autoHide);
        }
        // setHiding(false);
        autoHideRef.current = { timestamp };
      },
      [autoHide],
    );

    const onMouseMove = React.useCallback(() => {
      global.requestAnimationFrame(show);
    }, [show]);

    React.useEffect(() => {
      if (!autoHideRef) {
        return;
      }
      if (hiding || hovering || sliding) {
        autoHideRef.current = null;
        return;
      }
      if (autoHideRef.current) {
        return;
      }
      autoHideRef.current = {};
      global.requestAnimationFrame(autoHide);
    }, [hiding, hovering, sliding, autoHide]);

    React.useEffect(() => {
      if (hiding) {
        setVisible(false);
      }
    }, [hiding]);

    const onBodyClick = React.useCallback(() => setVisible(false), []);
    React.useEffect(() => {
      document.body.addEventListener('click', onBodyClick);
      return () => document.body.removeEventListener('click', onBodyClick);
    }, [onBodyClick]);

    const onMenuClick = React.useCallback(
      e => {
        changePlaybackRate(parseFloat(e.key, 10));
        setVisible(false);
      },
      [changePlaybackRate],
    );

    return (
      <div className={styles.reactPlayerSkin} onMouseMove={onMouseMove}>
        <div className={src ? styles.hiddenVideoMask : styles.videoMask} />
        {poster && (!src || loading) && <img className={styles.poster} src={poster} alt="" />}
        {(waiting || seeking) && !loading && (
          <div className={styles.waiting}>
            <Icon type="loading" />
          </div>
        )}
        {ended && (
          <button className={styles.ended} onClick={onPlayClick}>
            <Icon type="play-circle" />
          </button>
        )}
        <div
          className={hiding && !hovering && !sliding ? styles.hiddenControls : styles.controls}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <TimeSlider
            duration={duration}
            currentTime={currentTime}
            buffered={buffered}
            setSliding={setSliding}
            onChange={changeCurrentTime}
          />
          <div className={styles.bar}>
            <div className={styles.flexItem}>
              {ended && (
                <button type="button" onClick={onPlayClick}>
                  <Icon type="caret-right" />
                </button>
              )}
              {paused && !ended && (
                <button type="button" onClick={onPlayClick}>
                  <Icon type="caret-right" />
                </button>
              )}
              {!paused && !ended && (
                <button type="button" onClick={onPauseClick}>
                  <Icon type="pause" />
                </button>
              )}
              <span className={styles.volume}>
                {(muted || 0 === volume) && (
                  <button type="button" onClick={onMutedClick}>
                    <Icon component={MutedSvg} />
                  </button>
                )}
                {!muted && 0 !== volume && (
                  <button type="button" onClick={onMutedClick}>
                    <Icon component={UnmutedSvg} />
                  </button>
                )}
                <span className={styles.volumeSlider}>
                  <Slider value={volume * 100} onChange={v => changeVolume(v / 100)} max={100} />
                </span>
              </span>
              <span className={styles.controlText}>
                {numeral(currentTime).format('00:00:00')}
                {0 <= duration ? ` / ${numeral(duration).format('00:00:00')}` : ''}
              </span>
              {0 > duration && (
                <span className={styles.controlText}>
                  <span className={styles.liveDot} />
                  直播
                </span>
              )}
            </div>
            {pictureInPictureEnabled && (
              <button
                type="button"
                className={styles.textBtn}
                onClick={pip ? exitPictureInPicture : requestPictureInPicture}
              >
                画中画
              </button>
            )}
            {0 <= duration && (
              <Dropdown
                visible={visible}
                overlay={
                  <Menu selectedKeys={[playbackRate.toString()]} onClick={onMenuClick}>
                    <Menu.Item key="0.25">&nbsp;&nbsp;0.25 倍速&nbsp;&nbsp;</Menu.Item>
                    <Menu.Item key="0.5">&nbsp;&nbsp;0.5 倍速&nbsp;&nbsp;</Menu.Item>
                    <Menu.Item key="1">&nbsp;&nbsp;1 倍速&nbsp;&nbsp;</Menu.Item>
                    <Menu.Item key="1.25">&nbsp;&nbsp;1.25 倍速&nbsp;&nbsp;</Menu.Item>
                    <Menu.Item key="1.5">&nbsp;&nbsp;1.5 倍速&nbsp;&nbsp;</Menu.Item>
                    <Menu.Item key="2">&nbsp;&nbsp;2 倍速&nbsp;&nbsp;</Menu.Item>
                  </Menu>
                }
                placement="topRight"
                trigger={['click']}
              >
                <button type="button" className={styles.textBtn} onClick={() => setVisible(true)}>
                  倍速
                </button>
              </Dropdown>
            )}
            {fullscreen && (
              <button type="button" onClick={exitFullscreen}>
                <Icon type="fullscreen-exit" />
              </button>
            )}
            {!fullscreen && (
              <button type="button" onClick={requestFullscreen}>
                <Icon type="fullscreen" />
              </button>
            )}
          </div>
        </div>
        {x5playsinline && !x5videofullscreen && src && !loading && !waiting && !seeking && !ended && !kernelMsg && (
          <button className={styles.blocked} onClick={onPlayClick}>
            <Icon type="play-circle" />
          </button>
        )}
        {loading && !kernelMsg && (
          <div className={styles.loading}>
            <Icon type="loading" />
          </div>
        )}
        {kernelMsg && (
          <div className={styles.kernelMsg}>
            {kernelMsg.type}: {kernelMsg.detail}
          </div>
        )}
      </div>
    );
  },
);

ReactPlayerSkin.propTypes = {
  src: PropTypes.string,
  poster: PropTypes.string,
  controls: PropTypes.bool.isRequired,
  // state
  loading: PropTypes.bool.isRequired,
  paused: PropTypes.bool.isRequired,
  ended: PropTypes.bool.isRequired,
  seeking: PropTypes.bool.isRequired,
  waiting: PropTypes.bool.isRequired,
  onPlayClick: PropTypes.func.isRequired,
  onPauseClick: PropTypes.func.isRequired,
  // time
  duration: PropTypes.number.isRequired,
  buffered: PropTypes.object,
  currentTime: PropTypes.number.isRequired,
  changeCurrentTime: PropTypes.func.isRequired,
  // volume
  muted: PropTypes.bool.isRequired,
  volume: PropTypes.number.isRequired,
  changeVolume: PropTypes.func.isRequired,
  onMutedClick: PropTypes.func.isRequired,
  // playbackRate
  playbackRate: PropTypes.number.isRequired,
  changePlaybackRate: PropTypes.func.isRequired,
  // pip
  pictureInPictureEnabled: PropTypes.bool.isRequired,
  pip: PropTypes.bool.isRequired,
  requestPictureInPicture: PropTypes.func.isRequired,
  exitPictureInPicture: PropTypes.func.isRequired,
  // fullscreen
  x5playsinline: PropTypes.bool.isRequired,
  x5videofullscreen: PropTypes.bool.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  requestFullscreen: PropTypes.func.isRequired,
  exitFullscreen: PropTypes.func.isRequired,
  // kernel
  kernelMsg: PropTypes.object,
};

ReactPlayerSkin.defaultProps = {
  src: '',
  poster: '',
  buffered: null,
  kernelMsg: null,
};

export default ReactPlayerSkin;
