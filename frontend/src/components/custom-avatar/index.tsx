import React from "react";

import type { AvatarProps } from "antd";
import { Avatar as AntdAvatar } from "antd";

import { getNameInitials, getRandomColorFromString, resolveAssetUrl } from "@/utilities";

type Props = AvatarProps & {
  name?: string;
};

const CustomAvatarComponent = ({ name = "", style, ...rest }: Props) => {
  const src = resolveAssetUrl(rest?.src) ?? rest?.src;

  return (
    <AntdAvatar
      alt={name}
      size="small"
      style={{
        backgroundColor: src ? "transparent" : getRandomColorFromString(name),
        display: "flex",
        alignItems: "center",
        border: "none",
        ...style,
      }}
      {...rest}
      src={src}
    >
      {getNameInitials(name)}
    </AntdAvatar>
  );
};

export const CustomAvatar = React.memo(
  CustomAvatarComponent,
  (prevProps, nextProps) => {
    return prevProps.name === nextProps.name && prevProps.src === nextProps.src;
  },
);