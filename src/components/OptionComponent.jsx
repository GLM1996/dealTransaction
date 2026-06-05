import React, { useState, useEffect } from 'react';

export default function OptionComponent({ title, price = 0, data = {}, onChange }) {
    const [calculated, setCalculated] = useState(0);

    const radioGroupName = `${title.replace(/\s+/g, '_')}_optionType`;
    const { isPercent = false, value = '' } = data;

    useEffect(() => {
        if (price > 0 && value !== '') {
            let result;
            if (isPercent) {
                result = (parseFloat(value) / 100) * price;
                setCalculated(result.toFixed(2));
                onChange?.({ isPercent, value: parseFloat(value), amount: parseFloat(result.toFixed(2)) });
            } else {
                result = (parseFloat(value) / price) * 100;
                setCalculated(result.toFixed(2));
                onChange?.({ isPercent, value: parseFloat(value), amount: parseFloat(value) });
            }
        } else {
            setCalculated(0);
            onChange?.({ isPercent, value: 0 });
        }
    }, [value, isPercent, price]);

    const handleValueChange = (val) => {
        onChange?.({ ...data, value: val });
    };

    const handleTypeChange = (type) => {
        onChange?.({ isPercent: type === 'percent', value: '' });
    };

    return (
        <div className="col-12 d-flex flex-column mb-2">
            <b>{title}</b>
            <div className="input-group input-group-sm bg-secondary-subtle d-flex align-items-center p-2 rounded">
                {/* % Option */}
                <div className="form-check d-flex align-items-center gap-1 mx-2">
                    <input
                        className="form-check-input"
                        type="radio"
                        name={radioGroupName}
                        id={`${radioGroupName}_percent`}
                        checked={isPercent}
                        onChange={() => handleTypeChange('percent')}
                    />
                    <label htmlFor={`${radioGroupName}_percent`} className="form-check-label">%</label>
                </div>

                <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="e.g. 5"
                    disabled={!isPercent}
                    value={isPercent ? value : calculated}
                    onChange={(e) => handleValueChange(e.target.value)}
                />

                {/* $ Option */}
                <div className="form-check d-flex align-items-center gap-1 mx-2">
                    <input
                        className="form-check-input"
                        type="radio"
                        name={radioGroupName}
                        id={`${radioGroupName}_dollar`}
                        checked={!isPercent}
                        onChange={() => handleTypeChange('dollar')}
                    />
                    <label htmlFor={`${radioGroupName}_dollar`} className="form-check-label">$</label>
                </div>

                <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="e.g. 5"
                    disabled={isPercent}
                    value={!isPercent ? value : calculated}
                    onChange={(e) => handleValueChange(e.target.value)}
                />
            </div>
        </div>
    );
}
