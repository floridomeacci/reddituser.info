import React, { useMemo } from 'react';
import './TopLocations.css';

// Common location names to detect via pattern matching (fallback when NER unavailable)
const KNOWN_LOCATIONS = [
  // Countries
  'United States', 'USA', 'America', 'Canada', 'Mexico', 'Brazil', 'Argentina',
  'United Kingdom', 'UK', 'England', 'Scotland', 'Wales', 'Ireland', 'France', 
  'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Poland', 'Czech Republic', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Russia', 'Ukraine', 'Greece', 'Turkey', 'Israel', 'Egypt', 'South Africa',
  'India', 'China', 'Japan', 'South Korea', 'Korea', 'Taiwan', 'Thailand', 
  'Vietnam', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'Australia', 
  'New Zealand', 'Saudi Arabia', 'UAE', 'Dubai', 'Pakistan', 'Bangladesh',
  // Major cities
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco',
  'Seattle', 'Boston', 'Miami', 'Denver', 'Atlanta', 'Dallas', 'Austin', 'Portland',
  'Toronto', 'Vancouver', 'Montreal', 'London', 'Paris', 'Berlin', 'Munich',
  'Amsterdam', 'Brussels', 'Madrid', 'Barcelona', 'Rome', 'Milan', 'Vienna',
  'Prague', 'Warsaw', 'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Dublin',
  'Moscow', 'Tokyo', 'Osaka', 'Seoul', 'Beijing', 'Shanghai', 'Hong Kong',
  'Singapore', 'Bangkok', 'Sydney', 'Melbourne', 'Auckland', 'Mumbai', 'Delhi',
  'Bangalore', 'Tel Aviv', 'Cairo', 'Cape Town', 'Lagos', 'Nairobi',
  // US States
  'California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania',
  'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
  'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
  'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama',
  'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah', 'Nevada',
  'Iowa', 'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska', 'Hawaii',
  'Idaho', 'West Virginia', 'Maine', 'Montana', 'Rhode Island', 'Delaware',
  'South Dakota', 'North Dakota', 'Alaska', 'Vermont', 'Wyoming',
  // Regions
  'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Middle East',
  'Southeast Asia', 'East Asia', 'Western Europe', 'Eastern Europe', 'Scandinavia',
  'Pacific Northwest', 'Midwest', 'East Coast', 'West Coast', 'Bay Area', 'Silicon Valley'
];

const TopLocations = ({ comments, posts }) => {
  const topLocations = useMemo(() => {
    // Combine comments and posts
    const allContent = [...(comments || []), ...(posts || [])];
    
    // Extract all location entities with their source text
    const locationCounts = {};
    
    // First try NER entities
    let hasNerData = false;
    allContent.forEach(item => {
      if (item.entities && item.entities.locations && item.entities.locations.length > 0) {
        hasNerData = true;
        item.entities.locations.forEach(location => {
          const locationName = location.text;
          
          // Filter out locations with 4 letters or less
          if (locationName.length <= 4) {
            return;
          }
          
          if (!locationCounts[locationName]) {
            locationCounts[locationName] = {
              name: locationName,
              count: 0,
              avgScore: 0,
              scores: [],
              examples: []
            };
          }
          locationCounts[locationName].count++;
          locationCounts[locationName].scores.push(location.score);
          
          // Store example text (comment or post) - store all examples
          const text = item.comment || item.post || '';
          if (text) {
            locationCounts[locationName].examples.push(text);
          }
        });
      }
    });
    
    // Fallback: If no NER data, use pattern matching
    if (!hasNerData) {
      allContent.forEach(item => {
        const text = item.comment || item.body || item.post || item.selftext || item.title || '';
        if (!text) return;
        
        KNOWN_LOCATIONS.forEach(location => {
          // Case-insensitive word boundary match
          const regex = new RegExp(`\\b${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          const matches = text.match(regex);
          
          if (matches) {
            const locationName = location; // Use canonical name
            
            if (!locationCounts[locationName]) {
              locationCounts[locationName] = {
                name: locationName,
                count: 0,
                avgScore: 0,
                scores: [],
                examples: []
              };
            }
            locationCounts[locationName].count += matches.length;
            locationCounts[locationName].scores.push(0.8); // Pattern match confidence
            
            // Store example text
            if (text.length > 0 && locationCounts[locationName].examples.length < 5) {
              // Truncate long examples
              const truncated = text.length > 150 ? text.substring(0, 150) + '...' : text;
              if (!locationCounts[locationName].examples.includes(truncated)) {
                locationCounts[locationName].examples.push(truncated);
              }
            }
          }
        });
      });
    }
    
    // Calculate average scores
    const locations = Object.values(locationCounts).map(loc => ({
      ...loc,
      avgScore: loc.scores.length > 0 
        ? loc.scores.reduce((sum, s) => sum + s, 0) / loc.scores.length 
        : 0
    }));
    
    // Sort by highest confidence first, then by most mentions, and take top 10
    return locations
      .sort((a, b) => {
        // First sort by count (most mentioned)
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // If count is same, sort by confidence
        return b.avgScore - a.avgScore;
      })
      .slice(0, 10);
  }, [comments, posts]);

  if (topLocations.length === 0) {
    return (
      <div className="top-locations-container">
        <div className="no-data-message">
          <p>No location data available</p>
          <span className="no-data-hint">
            No location mentions found in user's content
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="top-locations-container">
      <div className="locations-list">
        {topLocations.map((location, index) => (
          <div key={location.name} className="location-item-wrapper">
            <div className="location-item">
              <div className="location-info">
                <span className="location-name">{location.name}</span>
                <span className="location-count">{location.count}×</span>
              </div>
              {location.examples.length > 0 && (
                <div className="location-tooltip">
                  {location.examples.slice(0, 3).map((example, idx) => (
                    <div key={idx} className="tooltip-example">
                      "{example}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopLocations;
