import OpenSeadragon, { extend } from 'OpenSeadragon';
import Dispatcher from '../dispatcher/Dispatcher';
import {
  MODE_UPDATE,
  ACTIVITY_UPDATE,
  ANNOTATIONS_CREATE,
  ANNOTATIONS_UPDATE_LAST,
  ANNOTATIONS_RESET,
  ZOOM_UPDATE,
  INITIALIZE,
} from '../constants/actionTypes';
import { MOVE } from '../constants/modes';
import { CHANGE_EVENT } from '../constants/events';

const data = {
  mode: MOVE,
  zoom: 1,
  // width and heigth contain the original width and height of the
  // SVG container, in pixels, at zoom level 1. These will remain
  // constant over time as the image scales up and down
  width: 0,
  height: 0,
  activityInProgress: false,
  annotations: [],
};

class AppStore extends OpenSeadragon.EventSource {
  getAll() {
    return data.annotations;
  }

  // multiplying the original width in pixels by the current
  // zoom level gives us the image width in pixels at the moment
  getWidth() {
    return data.width * data.zoom;
  }

  // idem for the heigth
  getHeight() {
    return data.height * data.zoom;
  }

  getLast() {
    return data.annotations[data.annotations.length - 1];
  }

  getMode() {
    return data.mode;
  }

  getZoomLevel() {
    return data.zoom;
  }

  isActivityInProgress() {
    return data.activityInProgress;
  }
}

const Store = new AppStore();

Dispatcher.register((action) => {
  switch (action.type) {
    case MODE_UPDATE:
      data.mode = action.mode;
      break;

    case ACTIVITY_UPDATE:
      data.activityInProgress = action.inProgress;
      break;

    case ANNOTATIONS_CREATE:
      data.annotations.push(action.annotation);
      break;

    case ANNOTATIONS_UPDATE_LAST:
      extend(Store.getLast()[1], action.update);
      break;

    case ANNOTATIONS_RESET:
      data.annotations = action.annotations;
      break;

    case ZOOM_UPDATE:
      data.zoom = action.zoom;
      break;

    case INITIALIZE:
      extend(data, action.options);
      break;
  }
  Store.raiseEvent(CHANGE_EVENT);
});

export default Store;
