import "./index.css";

const TimeframeSelector = (props) => {
  const {
    handleTimeframeChange,
    timeframeOptionDetails,
    activeOptionId,
  } = props;
  const { id, display_text } = timeframeOptionDetails;

  const onCLickTimeframButton = () => {
    handleTimeframeChange(id);
  };

  const activeBtn = activeOptionId === id ? "timeframe-active-btn" : "";

  return (
    <li>
      <button
        onClick={onCLickTimeframButton}
        className={`time-frame-btn ${activeBtn}`}
        type="button"
      >
        {display_text}
      </button>
    </li>
  );
};

export default TimeframeSelector;
