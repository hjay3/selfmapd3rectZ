export const formatJSON = (json: Record<string, any>): Record<string, any> => {
  // Sort object keys alphabetically
  const sortObject = (obj: Record<string, any>): Record<string, any> => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sortObject);
    }
    
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => ({
        ...acc,
        [key]: sortObject(obj[key])
      }), {});
  };

  return sortObject(json);
};

export interface Point {
  x: number;
  y: number;
  angle: number;
  value: number;
}

export interface DataPoint {
  category: string;
  label: string;
  value: number;
  details?: Record<string, any>;
}

export const extractDataPoints = (data: Record<string, any>): DataPoint[] => {
  const points: DataPoint[] = [];

  const processObject = (obj: Record<string, any>, category: string) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'number' && value >= 0 && value <= 10) {
        points.push({
          category,
          label: key,
          value,
          details: obj
        });
      } else if (typeof value === 'object' && value !== null) {
        processObject(value, key);
      }
    });
  };

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      processObject(value, key);
    }
  });

  return points;
};