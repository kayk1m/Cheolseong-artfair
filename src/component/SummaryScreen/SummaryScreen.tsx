import React from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

import ViewingRoom from '../ViewingRoom/ViewingRoom';
import Details from '../Details/Details';
import MenuScreen from '../MenuScreen/MenuScreen';
import IntroScreen from '../IntroScreen/IntroScreen';

import info from './summaryInfo.json';

const STORAGE_URL_MD = 'https://d3upf6md31d3of.cloudfront.net';

const idxMap = [-1, 53, 119, 89, 126, 197, -2];

interface MotionState {
  touchStartX: number;
  moved: boolean;
  beingTouched: boolean;
  // moveTo: string;
}

const defaultMotionState = {
  touchStartX: 0,
  moved: false,
  beingTouched: false,
  // moveTo: 'null',
};

const swipeThreshold = 100;

export default function SummaryScreen() {
  const MAX_INDEX = info.length + 1;
  const [index, setIndex] = React.useState<number>(0);
  const [onDetail, setOnDetail] = React.useState<boolean>(false);
  const [motionState, setMotionState] = React.useState<MotionState>(defaultMotionState);

  const ref = React.useRef<HTMLDivElement | null>(null);

  const focusSet = () => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  React.useEffect(() => {
    focusSet();
    const exIndex = sessionStorage.getItem('@index');
    if (exIndex) {
      setIndex(JSON.parse(exIndex));
    }
  }, []);

  const handleLeft = React.useCallback(() => {
    if (index !== 0) {
      if (onDetail) {
        setOnDetail(false);
        setTimeout(() => setIndex(index - 1), 700);
      } else {
        setTimeout(() => setIndex(index - 1), 10);
      }
      sessionStorage.setItem('@index', JSON.stringify(index - 1));
    }
  }, [index, onDetail]);

  const handleRight = React.useCallback(() => {
    if (index !== MAX_INDEX) {
      if (onDetail) {
        setOnDetail(false);
        setTimeout(() => setIndex(index + 1), 700);
      } else {
        setTimeout(() => setIndex(index + 1), 10);
      }
      sessionStorage.setItem('@index', JSON.stringify(index + 1));
    }
  }, [MAX_INDEX, index, onDetail]);

  const toggleDetail = () => {
    if (index !== 0 && index !== MAX_INDEX) {
      setOnDetail(!onDetail);
      sessionStorage.setItem('@index', JSON.stringify(index));
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.keyCode) {
      case 27:
        if (onDetail) {
          setOnDetail(false);
        }
        break;
      case 32:
        toggleDetail();
        break;
      case 37:
        handleLeft();
        break;
      case 39:
        handleRight();
        break;
      default:
        break;
    }
  };

  const handleMotion = {
    start: (clientX: number) => {
      // console.log('touch start');
      setMotionState({
        ...motionState,
        touchStartX: clientX,
        beingTouched: true,
      });
    },
    move: (clientX: number) => {
      if (motionState.beingTouched) {
        const deltaX = clientX - motionState.touchStartX;
        if (deltaX < -swipeThreshold) {
          setMotionState(defaultMotionState);
          handleRight();
        } else if (deltaX > swipeThreshold) {
          setMotionState(defaultMotionState);
          handleLeft();
        } else {
          setMotionState({
            ...motionState,
            moved: true,
          });
        }
      }
    },
    end: () => {
      // console.log('touch end');
      // if (motionState.beingTouched && !motionState.moved) {
      //   handleRight();
      // }
      setMotionState(defaultMotionState);
    },
  };

  const handleSwipe = {
    touchStart: (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length === 1) {
        handleMotion.start(event.targetTouches[0].clientX);
      }
    },
    touchMove: (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length === 1) {
        handleMotion.move(event.targetTouches[0].clientX);
      }
    },
    touchEnd: () => {
      handleMotion.end();
    },
  };

  React.useEffect(() => {
    window.addEventListener('touchstart', handleSwipe.touchStart, { passive: false });
    window.addEventListener('touchmove', handleSwipe.touchMove, { passive: false });
    window.addEventListener('touchend', handleSwipe.touchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleSwipe.touchStart);
      window.removeEventListener('touchmove', handleSwipe.touchMove);
      window.removeEventListener('touchend', () => handleSwipe.touchEnd());
    };
  }, [handleSwipe]);

  return (
    <div className="App">
      <div
        ref={ref}
        tabIndex={0}
        role="button"
        style={{
          filter: `brightness(${onDetail ? 0.8 : 1}) blur(${onDetail ? 10 : 0}px)`,
        }}
        className="viewingRoom"
        onClick={() => setOnDetail(false)}
        onKeyDown={handleKeydown}
      >
        {(index === 0 || index === MAX_INDEX) ? (
          <>
            {index === 0 ? (
              <IntroScreen />
            ) : (
              <MenuScreen />
            )}
          </>
        ) : (
          <ViewingRoom
            idx={idxMap[index]}
            src={`${STORAGE_URL_MD}/${info[index - 1].src}`}
          />
        )}
      </div>
      {index !== 0 && index !== MAX_INDEX && (
        <div
          style={{
            opacity: onDetail ? 1 : 0,
            zIndex: onDetail ? 100 : -1,
          }}
          className="detailScreen"
        >
          <Details
            idx={idxMap[index]}
            src={`${STORAGE_URL_MD}/${info[index - 1].src}`}
          />
        </div>
      )}
      <IconButton
        id="arrowLeft"
        className="fixed"
        onClick={handleLeft}
        disabled={index === 0}
        style={{
          color: index === 0 ? '#222' : 'rgba(149, 148, 160, 0.664)',
        }}
      >
        <ArrowBackIosIcon fontSize="large" />
      </IconButton>
      <IconButton
        id="arrowRight"
        className="fixed"
        onClick={handleRight}
        disabled={index === MAX_INDEX}
        style={{ color: index === MAX_INDEX ? '#222' : 'rgba(149, 148, 160, 0.664)' }}
      >
        <ArrowForwardIosIcon fontSize="large" />
      </IconButton>
      {index !== 0 && index !== MAX_INDEX && (
        <IconButton
          id="moreIcon"
          onClick={toggleDetail}
        >
          <AssignmentIcon fontSize="large" />
        </IconButton>
      )}
      <IconButton
        id="closeIcon"
        onClick={() => setOnDetail(false)}
        disabled={!onDetail}
        style={{ opacity: onDetail ? 1 : 0 }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
    </div>
  );
}
