import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DateRangeBox({onChange}){
  const [state, setState] = useState([{
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    key: 'selection'
  }]);

  const handle = (ranges) => {
    const sel = ranges.selection;
    setState([sel]);
    onChange?.(sel);
  };

  return (
    <div className="rounded-2xl border p-2 bg-white">
      <DateRange
        ranges={state}
        onChange={handle}
        minDate={new Date()}
        rangeColors={['#15803d']}
        direction="horizontal"
      />
    </div>
  );
}
