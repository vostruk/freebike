-- | Common type definitions for routes.
{-# LANGUAGE ViewPatterns, LambdaCase, RecordWildCards, OverloadedStrings #-}
module Freebike.Types where

import Control.Applicative
import Data.Monoid
import Data.Aeson
import Data.Maybe
import qualified Data.Vector as V
import qualified Data.IntMap as IM

data Point = Point
    { pointLatitude :: !Float
    , pointLongitude :: !Float
    }

instance Show Point where
    show (Point lat lon) = show (lat, lon)

instance FromJSON Point where
    parseJSON = withArray "Point" $ \case
        (V.toList -> [lat, lon]) -> Point <$> parseJSON lat <*> parseJSON lon
        _ -> fail "Expected a two-element array for Point"

instance ToJSON Point where
    toJSON (Point lat lon) = toJSON (lat, lon)

distanceSq :: Point -> Point -> Float
distanceSq (Point x1 y1) (Point x2 y2) = (x1 - x2) ^ 2 + (y1 - y2) ^ 2

hsin :: Float -> Float
hsin t = sin (t/2) ^ 2

distanceRad :: Float -> Point -> Point -> Float
distanceRad r (Point lat1 lon1) (Point lat2 lon2) =
  2*r*asin(min 1.0 root)
    where
      root = sqrt (hlat + cos lat1 * cos lat2 * hlon)
      hlat = hsin (lat2 - lat1)
      hlon = hsin (lon2 - lon1)

earthRadius :: Float
earthRadius = 6372.8

distanceEarth :: Point -> Point -> Float
distanceEarth a b = distanceRad earthRadius (convToDeg a) (convToDeg b)
  where
    convToDeg (Point lat lon) = Point (lat*pi/180) (lon*pi/180)

data Path = Path
    { pathDistance :: Float
    , pathTime :: Float
    , pathPoints :: Maybe (V.Vector Point)
    } deriving (Show)

instance FromJSON Path where
    parseJSON = withObject "Path" $ \obj ->
        Path <$> obj .: "distance"
             <*> obj .: "time"
             <*> (((obj .: "points") >>= (.: "coordinates")) <|> pure Nothing)

instance ToJSON Path where
    toJSON Path{..} = object
        [ "distance" .= pathDistance
        , "time" .= pathTime
        , "points" .= (case pathPoints of
            Just pp -> object [ "coordinates" .= pp ]
            Nothing -> Null
        )
        ]

instance Monoid Path where
    mempty = Path 0 0 Nothing
    (Path d1 t1 p1) `mappend` (Path d2 t2 p2) =
        Path (d1 + d2) (t1 + t2)
             (Just $ fromMaybe V.empty p1 <> fromMaybe V.empty p2)

type StationNumber = Int

data Station = Station
    { stationNumber :: StationNumber
    , stationName :: String
    , stationLocation :: Point
    } deriving (Show)

instance Eq Station where
    (Station n1 _ _) == (Station n2 _ _) = n1 == n2

instance ToJSON Station where
    toJSON Station{..} = object
        [ "number" .= stationNumber
        , "name" .= stationName
        , "location" .= stationLocation
        ]

-- Station location together with paths to other stations
data StationPaths = StationPaths
    { spStation :: Station
    , spPaths :: IM.IntMap Path
    -- ^ Paths to other stations
    }

instance FromJSON StationPaths where
    parseJSON = withObject "StationPaths" $ \obj ->
        StationPaths <$> (Station <$> obj .: "number" <*> obj .: "name" <*> obj .: "location")
                     <*> (IM.fromList <$> fmap spToPair <$> obj .: "paths")

instance ToJSON StationPaths where
    toJSON StationPaths{..} = object
        [ "number" .= stationNumber spStation
        , "name" .= stationName spStation
        , "location" .= stationLocation spStation
        , "paths" .= fmap pairToStationPath (IM.toList spPaths)
        ]

data StationPath = StationPath StationNumber Path

spToPair :: StationPath -> (StationNumber, Path)
spToPair (StationPath number path) = (number, path)

pairToStationPath :: (StationNumber, Path) -> StationPath
pairToStationPath (number, path) = StationPath number path

instance ToJSON StationPath where
    toJSON (StationPath number path) = object
        [ "number" .= number
        , "path" .= path
        ]

instance FromJSON StationPath where
    parseJSON = withObject "StationPath" $ \obj ->
        StationPath <$> obj .: "number" <*> obj .: "path"

