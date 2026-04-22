import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useGeolocation } from '../hooks/useGeolocation';

const LocationContext = createContext(null);

/**
 * Exposes a single geolocation source to every route and feature component.
 */
export function LocationProvider({ children }) {
  const geo = useGeolocation();

  return <LocationContext.Provider value={geo}>{children}</LocationContext.Provider>;
}

LocationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }

  return context;
};
