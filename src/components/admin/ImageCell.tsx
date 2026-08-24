import React from 'react'

type Props = {
  cellData?: string
}

/** Миниатюра фото в списках админки (поле image — текстовый URL) */
const ImageCell: React.FC<Props> = ({ cellData }) => {
  if (!cellData) {
    return (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 4,
          background: '#efe9dc',
          color: '#8a7d5e',
          fontSize: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        нет
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cellData}
      alt=""
      loading="lazy"
      style={{
        width: 72,
        height: 72,
        objectFit: 'cover',
        borderRadius: 4,
        border: '1px solid #ddd6c7',
        display: 'block',
      }}
    />
  )
}

export default ImageCell
