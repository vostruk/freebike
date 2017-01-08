module Freebike.Graph where

import Data.Set as S
import Data.IntMap as IM
import Data.Graph.AStar as AS
import qualified Data.ByteString.Lazy as BS
import Data.Aeson
import Freebike.Types

type Distance = Float
type Graph = IM.IntMap Node
--data Key = Int

data Node = Node { edges :: IM.IntMap Distance,
                   longitude :: Distance,
                   latitude :: Distance
                 }

-- How much time it takes to change bike (2 minutes)
-- in milliseconds
bikeChangeTime :: Distance
bikeChangeTime = 2 * 60 * 1000

getDistance :: Graph -> Key -> Key -> Distance
getDistance graph start goal = if start == goal then 0 else
-- very unsafe, but a* has proper assumption
  (edges (graph ! start)) ! goal + bikeChangeTime

getNeighbours :: Graph -> Key -> Set Key
getNeighbours graph nodeKey =
-- nodeKey will exist in DB!
  S.fromList $ IM.keys $ edges $ (graph ! nodeKey)

-- Maximum allowed time (20 minutes), in milliseconds.
maxTime :: Distance
maxTime = 20 * 60 * 1000

getAllowedTimeNeighbours :: Graph -> Key -> Set Key
getAllowedTimeNeighbours graph nodeKey =
  S.fromList $ IM.keys $ IM.filter (<= maxTime) $ edges $ (graph ! nodeKey)

foundGoal :: Key -> Key -> Bool
foundGoal goal node = (goal == node)

-- In case you needed, change [] case for debugging
addNodeToGraph :: Graph -> Key -> Distance -> Distance -> Graph
addNodeToGraph graph key long lat =
  case IM.lookup key graph of
    Nothing -> graph -- error "Node with given id already exist"
    (Just _) -> IM.insert key (Node IM.empty long lat) graph


-- In case you needed, change [] case for debuggin
addEdgeToGraph :: Graph -> Key -> Key -> Distance -> Graph
addEdgeToGraph graph start goal dist =
  case mNode of
    Nothing -> graph -- error "Path leads to not existing node"
    (Just node) -> IM.insert start (Node (IM.insert goal dist (edges node))
                                      (longitude node)
                                      (latitude node) ) graph
    where
      mNode = IM.lookup start graph


generateRoute :: Graph -> Key -> Key -> Maybe [Key]
generateRoute graph start goal =
  AS.aStar (getAllowedTimeNeighbours graph)
           (getDistance graph)
           (getDistance graph goal)
           (foundGoal goal)
           start

parseJSONFromFile :: FromJSON a => FilePath -> IO (Maybe a)
parseJSONFromFile file =
  decode <$> BS.readFile file


buildGraph :: [StationPaths] -> Graph
buildGraph = IM.fromList . fmap stationToPair
  where
    stationToPair (StationPaths (Station number _ (Point lat lon)) paths) =
        (number, node)
      where
        node = Node edgez lon lat
        edgez = fmap pathTime paths

readGraphFromFile :: FilePath -> IO (Maybe Graph)
readGraphFromFile fileName =
  fmap buildGraph <$> parseJSONFromFile fileName
