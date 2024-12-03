import React from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion } from 'framer-motion';

const HistoryItem = ({
  item,
  index,
  isEditMode,
  onSelect,
  onDelete,
  onToggleFavorite,
  onCopy,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (!isEditMode) {
      onSelect(item);
    }
  };

  return (
    <ListItem
      component={motion.div}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      sx={{
        mb: 1,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        cursor: isEditMode ? 'default' : 'pointer',
        '&:hover': {
          backgroundColor: isEditMode 
            ? theme.palette.background.paper 
            : alpha(theme.palette.primary.main, 0.1),
        },
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditMode ? (
            <Tooltip title="Eliminar" arrow>
              <IconButton
                edge="end"
                size="small"
                onClick={() => onDelete(index)}
                sx={{
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Copiar resultado" arrow>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(item);
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={item.favorite ? "Quitar de favoritos" : "Añadir a favoritos"} arrow>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(index);
                  }}
                  sx={{
                    color: item.favorite ? theme.palette.warning.main : theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.warning.main,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    },
                  }}
                >
                  {item.favorite ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      }
      onClick={handleClick}
    >
      <ListItemText
        primary={
          <Typography variant="body1" component="div">
            {typeof item === 'string' ? item : item.equation || item.operation}
          </Typography>
        }
        secondary={
          item.steps && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mt: 1,
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
              }}
            >
              {item.steps.join('\n')}
            </Typography>
          )
        }
      />
    </ListItem>
  );
};

export default HistoryItem; 